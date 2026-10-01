"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, Button, Card, Field, TopBar, inputClass } from "@/components/ui";
import { Icon } from "@/components/icons";
import { useStore } from "@/lib/store";
import { compressImage } from "@/lib/image";
import type { User } from "@/lib/types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EditProfile() {
  const { user } = useStore();
  // The form seeds itself from the profile, so wait until it has loaded.
  if (!user) return null;
  return <EditForm key={user.id} user={user} />;
}

function EditForm({ user }: { user: User }) {
  const { updateProfile } = useStore();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email ?? "");
  const [avatar, setAvatar] = useState<string | undefined>(user.avatar);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const nameOk = name.trim().length >= 2;
  const emailOk = !email.trim() || EMAIL.test(email.trim());
  const dirty =
    name.trim() !== user.name || email.trim() !== (user.email ?? "") || avatar !== user.avatar;

  async function pickPhoto(file: File | undefined) {
    if (!file) return;
    setPhotoError(null);
    try {
      // Small and square: it is shown at 64px at most.
      setAvatar(await compressImage(file, { maxSize: 320, quality: 0.8, square: true }));
    } catch {
      setPhotoError("Couldn't read that photo. Try a JPG or PNG.");
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function save() {
    updateProfile({ name: name.trim(), email: email.trim() || undefined, avatar });
    setSaved(true);
    setTimeout(() => router.push("/profile"), 600);
  }

  return (
    <div>
      <TopBar title="Edit profile" back="/profile" />

      <main className="px-5 py-5 space-y-4 pb-40">
        <Card className="p-5 flex flex-col items-center text-center">
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickPhoto(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="relative"
            aria-label="Change profile photo"
          >
            <Avatar initials={user.initials} src={avatar} className="w-24 h-24 text-2xl" />
            <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-400 text-ink-900 border-2 border-white flex items-center justify-center">
              <Icon name="camera" className="w-4 h-4" />
            </span>
          </button>
          <div className="flex gap-4 mt-3">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="text-sm font-semibold text-brand-600"
            >
              {avatar ? "Change photo" : "Add a photo"}
            </button>
            {avatar ? (
              <button
                type="button"
                onClick={() => setAvatar(undefined)}
                className="text-sm font-semibold text-red-500"
              >
                Remove
              </button>
            ) : null}
          </div>
          {photoError ? <p className="text-xs text-red-600 mt-2">{photoError}</p> : null}
        </Card>

        <Card className="p-4 space-y-4">
          <Field label="Full name" hint={nameOk ? undefined : "At least 2 characters."}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className={inputClass}
            />
          </Field>
          <Field label="Email" hint={emailOk ? "Optional — for receipts." : "That doesn't look like an email address."}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClass}
            />
          </Field>
        </Card>

        <Card className="divide-y divide-ink-100 overflow-hidden">
          <Link href="/profile/phone" className="flex items-center gap-3 p-4 hover:bg-ink-50">
            <Icon name="phone" className="w-5 h-5 text-ink-500 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">Phone number</span>
              <span className="block text-xs text-ink-500">{user.phone}</span>
            </span>
            <span className="text-xs font-semibold text-brand-600">Change</span>
          </Link>
          <Link href="/profile/verify" className="flex items-center gap-3 p-4 hover:bg-ink-50">
            <Icon name="id" className="w-5 h-5 text-ink-500 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">Verify your identity</span>
              <span className="block text-xs text-ink-500">National ID, front and back</span>
            </span>
            <Icon name="chevron" className="w-4 h-4 text-ink-300" />
          </Link>
        </Card>
      </main>

      <div className="fixed bottom-[68px] inset-x-0 z-40 mx-auto max-w-[520px] px-4">
        <Button onClick={save} disabled={!dirty || !nameOk || !emailOk || saved} variant="primary" size="lg" full>
          {saved ? "Saved ✓" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
