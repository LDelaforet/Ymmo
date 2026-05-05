interface CardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export default function Card({ title, children, className = "" }: CardProps) {
    return (
        <div
            className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition ${className}`}
        >
            {title && <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>}
            <div className="text-gray-700">{children}</div>
        </div>
    );
}
