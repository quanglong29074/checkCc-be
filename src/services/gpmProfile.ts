import { GpmProfile } from "../entity/gpmProfile";

export const addBrowserId = async (browserId: string, userId: string) => {
    const existingBrowserId = await GpmProfile.findOne({ browser_id: browserId, user_id: userId })
    if (existingBrowserId) {
        console.log("browserId đã tồn tại: ", browserId);
        return existingBrowserId;
    } else {
        const newBrowserId = new GpmProfile({ browser_id: browserId, user_id: userId })
        await newBrowserId.save();
        return newBrowserId;
    }
}
