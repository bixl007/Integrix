

export const HeroVideo = () => {
    return (
        <div className="w-full h-full relative group">
            <video
                src="https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-1728-large.mp4"
                poster="https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-1728-0.jpg"
                controls={false}
                muted={true}
                autoPlay={true}
                loop={true}
                playsInline={true}
                className="w-full h-full object-cover rounded-xl"
            >
                <source src="https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-1728-large.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
        </div>
    )
}