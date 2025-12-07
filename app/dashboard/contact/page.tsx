"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

const ContactPage = () => {
  return (
    <div className="container mx-auto max-w-5xl p-6 space-y-8 flex flex-col justify-center items-center h-[80vh]">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Contact Me</h1>
        <p className="text-muted-foreground">
          Feel free to reach out via email or check out my profiles.
        </p>
      </div>

      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-center">Get in Touch</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link
              href="https://github.com/shobhitsingh-2503"
              target="_blank"
              className="flex items-center gap-3 text-sm font-medium hover:text-primary transition-colors p-3 rounded-lg hover:bg-muted border"
            >
              <div className="bg-black/10 p-2 rounded-full dark:bg-white/10">
                <Github className="h-5 w-5" />
              </div>
              <span className="flex-1">GitHub</span>
            </Link>
            <Link
              href="https://www.linkedin.com/in/shobhitsingh25032003/"
              target="_blank"
              className="flex items-center gap-3 text-sm font-medium hover:text-primary transition-colors p-3 rounded-lg hover:bg-muted border"
            >
              <div className="bg-blue-100 text-blue-700 p-2 rounded-full dark:bg-blue-900 dark:text-blue-300">
                <Linkedin className="h-5 w-5" />
              </div>
              <span className="flex-1">LinkedIn</span>
            </Link>
            <Link
              href="mailto:shobhitsingh25032003@gmail.com"
              target="_blank"
              className="flex items-center gap-3 text-sm font-medium hover:text-primary transition-colors p-3 rounded-lg hover:bg-muted border"
            >
              <div className="bg-orange-100 text-orange-700 p-2 rounded-full dark:bg-orange-900 dark:text-orange-300">
                <Mail className="h-5 w-5" />
              </div>
              <span className="flex-1">Mail</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactPage;
