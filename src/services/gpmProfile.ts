import { GpmProfile } from "../entity/gpmProfile";
import { Proxy } from "../entity/proxy";

export const addBrowserIds = async (browserIds: string[], userId: string) => {
    const results = await Promise.all(browserIds.map(async (browserId) => {
        try {
            const existingBrowserId = await GpmProfile.findOne({ browser_id: browserId, user_id: userId });
            if (existingBrowserId) {
                console.log("browserId đã tồn tại: ", browserId);
                return existingBrowserId;
            } else {
                const newBrowserId = new GpmProfile({ browser_id: browserId, user_id: userId });
                await newBrowserId.save();
                return newBrowserId;
            }
        } catch (error) {
            console.error(`Lỗi khi thêm browserId: ${browserId}`, error);
            return null;
        }
    }));

    return results;
}

export const addProxy = async (proxys: string[], userId: string) => {
    const results = await Promise.all(proxys.map(async (proxy) => {
        try {
            const existingProxy = await Proxy.findOne({ proxy: proxy, user_id: userId });
            if (existingProxy) {
                console.log("browserId đã tồn tại: ", proxy);
                return existingProxy;
            } else {
                const newProxy = new Proxy({ proxy: proxy, user_id: userId });
                await newProxy.save();
                return newProxy;
            }
        } catch (error) {
            console.error(`Lỗi khi thêm browserId: ${proxy}`, error);
            return null;
        }
    }));

    return results;
}
