export const loadFFmpeg = async (url: string): Promise<HTMLScriptElement> => {
    return new Promise((resolve, reject) => {
      const script: HTMLScriptElement = document.createElement("script");
      let loaded: boolean = false;
      script.async = true;
      script.defer = true;
      script.src = url;
  
      script.onload = () => {
        if (!loaded) {
          resolve(script);
        }
        loaded = true;
      };
  
      script.onerror = () => {
        console.error("Failed to load ffmpeg.wasm");
        reject(new Error("Failed to load ffmpeg.wasm"));
      };
  
      document.getElementsByTagName("head")[0].appendChild(script);
    });
  };
  

  export const convertToHHMMSS = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds();
    if (hh) {
        return `${hh}:${mm.toString().padStart(2, "0")}:${ss
            .toString()
            .padStart(2, "0")}`;
    } else {
        return `${mm.toString().padStart(2, "0")}:${ss
            .toString()
            .padStart(2, "0")}`;
    }
  
    return `${hh}:${mm.toString().padStart(2, "0")}:${ss
        .toString()
        .padStart(2, "0")}`;
}