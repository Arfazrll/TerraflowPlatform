"use client";

import Navbar from "../../components/Navbar";
import DeveloperParticles from "../../components/DeveloperParticles";
import { Github, Instagram, Linkedin, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DevelopersPage() {
    const developers = [
        {
            id: 1,
            name: "Developer Name 1",
            nim: "123456789",
            role: "Frontend Engineer",
            image: "/placeholder-user.jpg", // Replace with actual image path
            bio: "Passionate about building interactive user interfaces and creating seamless web experiences.",
            socials: {
                github: "#",
                linkedin: "#",
                instagram: "#"
            }
        },
        {
            id: 2,
            name: "Developer Name 2",
            nim: "987654321",
            role: "Backend Engineer",
            image: "/placeholder-user.jpg", // Replace with actual image path
            bio: "Dedicated to designing robust server-side architectures and optimizing database performance.",
            socials: {
                github: "#",
                linkedin: "#",
                instagram: "#"
            }
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
            <Navbar />
            <DeveloperParticles />

            <main className="relative pt-32 pb-20 px-6 min-h-screen flex flex-col items-center justify-center z-10">
                {/* Background Gradients */}
                <div className="absolute inset-0 pointer-events-none -z-10">
                    <div className="absolute top-20 left-10 h-72 w-72 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-20 right-10 h-96 w-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />
                </div>

                <div className="text-center mb-16 max-w-2xl relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Meet the Team
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        The creative minds behind Terraflow. Passionate students building solutions for a sustainable future.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 md:gap-12 w-full max-w-5xl">
                    {developers.map((dev) => (
                        <DeveloperCard key={dev.id} developer={dev} />
                    ))}
                </div>
            </main>

            <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground bg-card/30 backdrop-blur-sm">
                <p>© 2025 Terraflow. Built with passion.</p>
            </footer>
        </div>
    );
}

function DeveloperCard({ developer }: { developer: any }) {
    return (
        <div className="group relative w-full h-[400px] rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 border border-border bg-card">

            <div className="absolute inset-0 bg-muted flex items-center justify-center overflow-hidden">
                {/* Using a div placeholder if image is missing, otherwise Image component */}
                {/* <Image src={developer.image} alt={developer.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:blur-sm" /> */}
                <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-4xl group-hover:scale-110 group-hover:blur-sm transition-all duration-700">
                    PHOTO
                </div>
            </div>

            {/* Gradient Overlay - Fades to Card Background Color to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent/50 to-card/90 z-10 transition-opacity duration-500" />

            {/* Content Container */}
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 transition-transform duration-500">

                {/* Basic Info (Always Visible but moves up on hover) */}
                <div className="transform translate-y-24 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold tracking-wider text-primary bg-primary/10 rounded-full border border-primary/20">
                        {developer.nim}
                    </span>
                    <h2 className="text-3xl font-bold text-card-foreground mb-1 group-hover:text-primary transition-colors">
                        {developer.name}
                    </h2>
                    <p className="text-muted-foreground font-medium mb-4">{developer.role}</p>

                    {/* Detailed Info (Revealed on Hover) */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 text-muted-foreground text-sm leading-relaxed space-y-4">
                        <p>{developer.bio}</p>

                        <div className="flex gap-4 pt-2">
                            <SocialLink href={developer.socials.github} icon={<Github className="w-5 h-5" />} />
                            <SocialLink href={developer.socials.linkedin} icon={<Linkedin className="w-5 h-5" />} />
                            <SocialLink href={developer.socials.instagram} icon={<Instagram className="w-5 h-5" />} />
                            <a href="#" className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors text-secondary-foreground">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors text-secondary-foreground"
        >
            {icon}
        </Link>
    );
}
