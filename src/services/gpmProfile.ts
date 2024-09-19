import { GpmProfile } from "../entity/gpmProfile";

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

