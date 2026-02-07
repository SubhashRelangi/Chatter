import { Inbox } from "lucide-react";

const NoChatSelected = () => {
    return (
        <div className="flex-1 h-full flex items-center justify-center bg-base-200">
            <div className="max-w-md text-center space-y-5 px-6">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse border border-primary/30 shadow-xl">
                        <Inbox className="w-10 h-10 text-primary" />
                    </div>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-base-content tracking-wide">No Chat Selected</h2>
                <p className="text-base-content/60 text-base sm:text-lg">
                    Choose a user from the sidebar to begin your conversation. This space is ready when you are.
                </p>
            </div>
        </div>
    );
};

export default NoChatSelected;
