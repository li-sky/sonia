import torch
import torch.nn as nn
import torchaudio

class TemporalAwarePooling(nn.Module):
    def __init__(self, order=5, eps=1e-6):
        super().__init__()
        self.order = order
        self.eps = eps

    def forward(self, x):
        # 输入x: [batch_size, seq_len, feature_dim]
        mean = x.mean(dim=1, keepdim=True)  # 修正批次处理
        centered = x - mean
        moments = [mean.squeeze(1)]
        
        # 二阶矩
        var = torch.mean(centered**2, dim=1)
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
    def __init__(self, feature_dim, device='cpu'):
        self.feature_dim = feature_dim
        self.classes = {}
        self.shared_cov = torch.zeros(feature_dim, feature_dim, device=device)
        self.shared_cov_inv = None  # Cache for the pseudo-inverse
        self.total_samples = 0
        self.shared_mean = torch.zeros(feature_dim, device=device)
        self.device = device

    def update(self, features, label):
        features = features.detach().to(self.device)
        # Update overall mean
        old_mean = self.shared_mean.clone()
        self.shared_mean = (self.shared_mean * self.total_samples + features) / (self.total_samples + 1)

        # Update class statistics
        if label not in self.classes:
            self.classes[label] = {
                'mean': features.clone(),
                'count': 1
            }
        else:
            cls = self.classes[label]
            cls['count'] += 1
            cls['mean'] += (features - cls['mean']) / cls['count']

        # Update shared covariance
        self.total_samples += 1
        if self.total_samples > 1:
            delta_old = features - old_mean
            delta_new = features - self.shared_mean
            self.shared_cov = (self.shared_cov * (self.total_samples - 1) + 
                               torch.outer(delta_old, delta_new)) / self.total_samples
            # Invalidate the cached inverse
            self.shared_cov_inv = None

    def predict(self, features):
        # Ensure features are on CPU and squeeze the batch dimension
        features = features.cpu().squeeze(0)
        scores = []
        # Only compute pseudo-inverse if it's not already cached
        if self.shared_cov_inv is None:
            self.shared_cov_inv = torch.linalg.pinv(self.shared_cov)
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
        # 初始化主干网络（GPU）
        if backbone_name == 'wav2vec2':
            bundle = torchaudio.pipelines.WAV2VEC2_BASE
            self.backbone = bundle.get_model().to('cuda')  # 主干网络固定在GPU
            for param in self.backbone.parameters():
                param.requires_grad = False
        self.tap = TemporalAwarePooling(order=tap_order)
        self.lda = None

    def forward(self, x):
        # 输入x在GPU，特征提取后转到CPU
        with torch.no_grad():
            features, _ = self.backbone.extract_features(x.to('cuda'))  # 确保输入在GPU
            features = features[-1].cpu()  # 特征移至CPU
        pooled = self.tap(features)
        return pooled

    def update_classifier(self, features, label):
        # 确保特征在CPU
        features = features.cpu()
        if self.lda is None:
            feat_dim = features.shape[-1]
            self.lda = StreamingLDA(feat_dim, device='cpu')  # 分类器在CPU
        self.lda.update(features.squeeze(0), label)



if __name__ == "__main__":
    # 初始化模型
    model = TAPSLDA(tap_order=5)
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    model.to(device)
    
    # 输入数据
    directory_train = "./src-py/data/train/"
    with open(directory_train+"description.json", encoding='utf-8') as f:
        import json
        data = json.load(f)

    # 训练模型
    for entry in data:
        # 直接使用文件路径
        import os
        audio_path = os.path.join(directory_train, entry['filename'])
        # load audio
        audio, samplerate = torchaudio.load(audio_path)
        # resample
        resampler = torchaudio.transforms.Resample(samplerate, 16000)
        audio = resampler(audio)
        # use left channel
        audio = audio[0].unsqueeze(0)
        # forward
        features = model(audio.to(device))  # 短暂传入GPU，返回后自动在CPU
        model.update_classifier(features, entry['label'])
    print("Training done.")
    # 预测样本
    directory_test = "./src-py/data/test/"
    with open(directory_test+"description.json", encoding='utf-8') as f:
        data = json.load(f)
    for entry in data:
        audio_path = os.path.join(directory_test, entry['filename'])
        audio, samplerate = torchaudio.load(audio_path)
        resampler = torchaudio.transforms.Resample(samplerate, 16000)
        audio = resampler(audio)
        audio = audio[0].unsqueeze(0)
        audio = audio.to(device)
        features = model(audio.to(device))
        print("feature predicted")
        scores = model.lda.predict(features)
        print(entry['filename'], scores)
    