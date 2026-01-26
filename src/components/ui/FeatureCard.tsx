"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    delay?: number;
}

export function FeatureCard({
    title,
    description,
    icon,
    delay = 0,
}: FeatureCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
        >
            <Card
                className="bg-[#1A2F21]/40 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
                style={{ willChange: 'transform' }}
            >
                <CardHeader>
                    {icon}
                    <CardTitle className="text-white">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-300">{description}</p>
                </CardContent>
            </Card>
        </motion.div>
    );
}
