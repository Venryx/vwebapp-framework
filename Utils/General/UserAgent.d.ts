export declare const supportedBrowsers: string[];
export declare type supportedBrowsers = "Chrome" | "Firefox" | "Safari" | "Mobile Safari" | "Chrome WebView" | "Edge";
declare type BrowserName = "Amaya" | "Android Browser" | "Arora" | "Avant" | "Baidu" | "Blazer" | "Bolt" | "Camino" | "Chimera" | "Chrome" | "Chromium" | "Comodo Dragon" | "Conkeror" | "Dillo" | "Dolphin" | "Doris" | "Edge" | "Epiphany" | "Fennec" | "Firebird" | "Firefox" | "Flock" | "GoBrowser" | "iCab" | "ICE Browser" | "IceApe" | "IceCat" | "IceDragon" | "Iceweasel" | "IE" | "IE Mobile" | "Iron" | "Jasmine" | "K-Meleon" | "Konqueror" | "Kindle" | "Links" | "Lunascape" | "Lynx" | "Maemo" | "Maxthon" | "Midori" | "Minimo" | "MIUI Browser" | "Safari" | "Mobile Safari" | "Mosaic" | "Mozilla" | "Netfront" | "Netscape" | "NetSurf" | "Nokia" | "OmniWeb" | "Opera" | "Opera Mini" | "Opera Mobi" | "Opera Tablet" | "PhantomJS" | "Phoenix" | "Polaris" | "QQBrowser" | "RockMelt" | "Silk" | "Skyfire" | "SeaMonkey" | "SlimBrowser" | "Swiftfox" | "Tizen" | "UCBrowser" | "Vivaldi" | "w3m" | "WeChat" | "Yandex";
export declare function GetBrowser(): {
    name: BrowserName;
    version: string;
};
export {};
