let portNumber = -1;

async function initPortNumber() {
    try {
        const port = await window.electron.fetchPort();
        portNumber = port;
        console.log(portNumber);
    } catch (error) {
        console.error(error);
    }
}
export { portNumber, initPortNumber };