import torch
import torch.nn as nn
import torchaudio

import sounddevice as sd
import numpy as np
from matplotlib import pyplot as plt
from matplotlib.animation import FuncAnimation
from collections import deque
from threading import Lock, Thread
import time
import os
import json

# ================== 配置参数 ==================
SAMPLE_RATE = 16000          # 模型要求的采样率
CHUNK_MS = 5                 # 音频块时长（毫秒）
WINDOW_SEC = 1.0             # 时间窗口长度（秒）
PLOT_REFRESH_MS = 50         # 直方图刷新间隔(ms)，适当调大刷新间隔
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


# ================== 异步音频流处理类 ==================
class RealtimeKWS:
    def __init__(self, model):
        self.model = model
        # 用于保存原始音频数据，长度固定为 1s 采样点数
        self.audio_buffer = deque(maxlen=int(SAMPLE_RATE * WINDOW_SEC))
        self.lock = Lock()
        self.scores = None

        # 控制处理线程的标志
        self.running = True
        self.processing_thread = Thread(target=self.process_audio_buffer)
        self.processing_thread.daemon = True  # 主线程退出时，自动结束

        # 初始化绘图
        plt.rcParams["font.family"] = "Microsoft YaHei"
        self.fig, self.ax = plt.subplots()
        self.bars = None

    def audio_callback(self, indata, frames, time_info, status):
        """音频回调函数，仅负责采集数据，不做耗时操作"""
        if status:
            print("Audio error:", status)
        # 只取第一个通道数据，复制防止底层数据共享问题
        audio_chunk = torch.from_numpy(indata[:, 0].copy()).float()
        # 可根据需要进行幅度缩放，这里保留原样或按需转换
        # audio_chunk = audio_chunk * (2**15)
        with self.lock:
            self.audio_buffer.extend(audio_chunk.numpy())

    def process_audio_buffer(self):
        """
        在独立线程中异步处理缓冲区中的音频数据：
         - 当缓冲区内样本达到1秒长度时，截取最新数据做推理
         - 处理完成后将结果保存到self.scores供绘图更新
        """
        while self.running:
            audio_tensor = None
            with self.lock:
                if len(self.audio_buffer) >= int(SAMPLE_RATE * WINDOW_SEC):
                    # 取最新1秒的音频数据
                    audio_array = list(self.audio_buffer)[-int(SAMPLE_RATE * WINDOW_SEC):]
                    audio_tensor = torch.FloatTensor(audio_array).unsqueeze(0)
            if audio_tensor is not None:
                # 模型推理（耗时操作移到后台线程中）
                try:
                    features = self.model(audio_tensor.to(DEVICE))
                    self.scores = self.model.lda.predict(features)
                except Exception as e:
                    print("Model inference error:", e)
            # 适当延时，防止线程占用过高CPU资源
            time.sleep(0.01)

    def plot_update(self, frame=None):
        """直方图更新函数"""
        if self.scores is None:
            return None

        # 清空当前绘图
        self.ax.clear()
        labels = []
        values = []
        for score, label in self.scores:
            labels.append(label)
            values.append(score)

        self.ax.bar(labels, values)
        self.ax.set_ylim(-10, 0)  # 根据实际得分范围设置
        self.ax.set_title('Keyword Scores')
        return self.bars

    def start(self):
        """启动实时处理流程"""
        # 启动后台处理线程
        self.processing_thread.start()
        # 创建音频流，注意callback函数仅采集数据
        stream = sd.InputStream(
            samplerate=SAMPLE_RATE,
            blocksize=int(SAMPLE_RATE * CHUNK_MS / 1000),
            channels=1,
            callback=self.audio_callback
        )
        # 使用FuncAnimation定时刷新图形
        ani = FuncAnimation(self.fig, self.plot_update, interval=PLOT_REFRESH_MS)
        with stream:
            print("==> 开始实时语音识别 (按Ctrl+C退出)...")
            try:
                plt.show()
            except KeyboardInterrupt:
                pass
        # 结束后台处理线程
        self.running = False
        self.processing_thread.join()


# ================== TemporalAwarePooling 和 StreamingLDA 模块 ==================
class TemporalAwarePooling(nn.Module):
    def __init__(self, order=5, eps=1e-6):
        super().__init__()
        self.order = order
        self.eps = eps

    def forward(self, x):
        # 输入 x: [batch_size, seq_len, feature_dim]
        mean = x.mean(dim=1, keepdim=True)
        centered = x - mean
        moments = [mean.squeeze(1)]
        # 二阶矩（标准差）
        var = torch.mean(centered ** 2, dim=1)
        std = torch.sqrt(var + self.eps)
        moments.append(std)
        # 高阶矩
        for r in range(3, self.order + 1):
            normalized = centered / (std.unsqueeze(1) + self.eps)
            moment_r = torch.mean(normalized ** r, dim=1)
            moments.append(moment_r)
        pooled = torch.cat(moments, dim=1)
        return pooled

class StreamingLDA:
    def __init__(self, feature_dim, device='cuda'):
        self.feature_dim = feature_dim
        self.classes = {}
        self.shared_cov = torch.zeros(feature_dim, feature_dim, device=device)
        self.shared_cov_inv = None  # 用于缓存逆矩阵
        self.total_samples = 0
        self.shared_mean = torch.zeros(feature_dim, device=device)
        self.device = device

    def update(self, features, label):
        features = features.detach().to(self.device)
        # 更新总体均值
        old_mean = self.shared_mean.clone()
        self.shared_mean = (self.shared_mean * self.total_samples + features) / (self.total_samples + 1)
        # 更新各类别统计
        if label not in self.classes:
            self.classes[label] = {
                'mean': features.clone(),
                'count': 1
            }
        else:
            cls = self.classes[label]
            cls['count'] += 1
            cls['mean'] += (features - cls['mean']) / cls['count']
        # 更新共享协方差
        self.total_samples += 1
        if self.total_samples > 1:
            delta_old = features - old_mean
            delta_new = features - self.shared_mean
            self.shared_cov = (self.shared_cov * (self.total_samples - 1) + 
                               torch.outer(delta_old, delta_new)) / self.total_samples
            self.shared_cov_inv = None  # 使缓存失效

    def predict(self, features):
        features = features.squeeze(0)
        scores = []
        if self.shared_cov_inv is None:
            self.shared_cov_inv = torch.linalg.pinv(self.shared_cov.to(DEVICE))
        inv_cov = self.shared_cov_inv
        for label, cls in self.classes.items():
            diff = features - cls['mean']
            diff = diff.unsqueeze(0)
            mahal_dist = torch.matmul(torch.matmul(diff, inv_cov), diff.t())
            score = -0.5 * mahal_dist.item()
            scores.append((score, label))
        return scores

class TAPSLDA(nn.Module):
    def __init__(self, backbone_name='wav2vec2', tap_order=5):
        super().__init__()
        # 初始化主干网络（这里使用 wav2vec2）
        if backbone_name == 'wav2vec2':
            bundle = torchaudio.pipelines.WAV2VEC2_LARGE
            self.backbone = bundle.get_model().to(DEVICE)
            for param in self.backbone.parameters():
                param.requires_grad = False
        self.tap = TemporalAwarePooling(order=tap_order)
        self.lda = None

    def forward(self, x):
        with torch.no_grad():
            features, _ = self.backbone.extract_features(x.to(DEVICE))
            features = features[-1]
        pooled = self.tap(features)
        return pooled

    def update_classifier(self, features, label):
        if self.lda is None:
            feat_dim = features.shape[-1]
            self.lda = StreamingLDA(feat_dim, device=DEVICE)
        self.lda.update(features.squeeze(0), label)


if __name__ == "__main__":
    # ================== 模型训练 ==================
    # 初始化模型
    model = TAPSLDA(tap_order=5)
    model.to(DEVICE)
    
    # 加载训练数据描述文件
    directory_train = "./src-py/data/train/"
    with open(os.path.join(directory_train, "description.json"), encoding='utf-8') as f:
        data = json.load(f)

    # 训练模型，更新 StreamingLDA
    for entry in data:
        audio_path = os.path.join(directory_train, entry['filename'])
        audio, samplerate = torchaudio.load(audio_path)
        # 重采样到 16000Hz
        resampler = torchaudio.transforms.Resample(samplerate, SAMPLE_RATE)
        audio = resampler(audio)
        # 只使用左声道
        audio = audio[0].unsqueeze(0)
        features = model(audio.to(DEVICE))
        model.update_classifier(features, entry['label'])
    print("Training done.")

    # 模型预热
    audio = torch.randn(1, SAMPLE_RATE)
    features = model(audio.to(DEVICE))
    prediction = model.lda.predict(features)
    print("Warmup done.")

    # ================== 启动异步实时处理 ==================
    kws = RealtimeKWS(model)
    kws.start()
