interface UserAvatarProps {
    name: string
    size?: "sm" | "md"
}

const sizeClasses = {
    sm: "h-8 w-8 text-[11px]",
    md: "h-9 w-9 text-xs",
} as const

export function UserAvatar({ name, size = "md" }: UserAvatarProps) {
    const initials = name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()

    return (
        <div
            className={`flex items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700 ${sizeClasses[size]}`}
        >
            {initials}
        </div>
    )
}