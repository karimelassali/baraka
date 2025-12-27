"use client";

import Avatar from "boring-avatars";

/**
 * UserAvatar component that uses the boring-avatars library.
 * Renders an SVG avatar based on the provided name (seed).
 */
export default function UserAvatar({
    name,
    size = 40,
    variant = "beam",
    colors = ["#FF0000", "#FFFFFF", "#000000"], // Red, White, Black
    className,
    style
}) {
    return (
        <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
            <Avatar
                size={size}
                name={name}
                variant={variant}
                colors={colors}
            />
        </div>
    );
}
