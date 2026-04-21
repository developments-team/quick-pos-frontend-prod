/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from "react";
import { Sun, Moon, Monitor, Camera, User, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { cn } from "../../lib/utils";

import { Input } from "../../components/ui/Input";
import { Button, buttonVariants } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { Modal } from "../../components/ui/Modal";
import { Spinner } from "../../components/ui/Spinner";
import { toast } from "../../components/ui/Toast";

import { Label } from "../../components/ui/Label";
import { Dropdown, DropdownItem } from "../../components/ui/Dropdown";
import { useLayout } from "../../context/LayoutContext";
import { useProvider } from "../../context/Provider";

interface ProfileSetupProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  onProfileComplete: (data: any) => void;
  onBack?: () => void;
}

export function ProfileSetup({
  isOpen,
  onClose,
  userData,
  onProfileComplete,
  onBack,
}: ProfileSetupProps) {
  const { themeMode, setThemeMode } = useLayout();
  const { createProfile } = useProvider();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(userData?.email || "");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [bio, setBio] = useState("");

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
  }>({});

  const changeTheme = (newTheme: "dark" | "light" | "system") => {
    setThemeMode(newTheme);
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPicture(file);
      const reader = new FileReader();
      reader.onloadend = () => setPicturePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: { firstName?: string; lastName?: string } = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (formData: FormData) => createProfile(formData),
    onSuccess: (data: any) => {
      if (data && data.status) {
        toast.success("Profile created successfully!", {
          title: "Profile Setup",
        });
        onProfileComplete(data);
      } else {
        toast.error(data?.message || "Failed to create profile.", {
          title: "Profile Setup",
        });
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "An error occurred. Please try again.", {
        title: "Profile Setup",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("firstName", firstName.trim());
    formData.append("lastName", lastName.trim());
    if (phone.trim()) formData.append("phone", phone.trim());
    if (email.trim()) formData.append("email", email.trim());
    if (address.trim()) formData.append("address", address.trim());
    if (dateOfBirth) formData.append("dateOfBirth", dateOfBirth);
    if (sex) formData.append("sex", sex);
    if (picture) formData.append("picture", picture);
    if (bio.trim()) formData.append("bio", bio.trim());

    mutation.mutate(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      hideClose
      comingFrom="center"
    >
      <div className="space-y-6">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-20">
          <Dropdown
            trigger={
              <div
                className={buttonVariants({
                  variant: "ghost",
                  size: "icon",
                  className:
                    "rounded-full hover:bg-(--table-border) hover:text-(--text-primary)",
                })}
              >
                {themeMode === "system" ? (
                  <Monitor size={20} />
                ) : themeMode === "dark" ? (
                  <Moon size={20} />
                ) : (
                  <Sun size={20} />
                )}
              </div>
            }
            className="min-w-[180px]"
          >
            <div className="p-2 space-y-2">
              <DropdownItem
                icon={<Sun size={20} />}
                onClick={() => changeTheme("light")}
                className={cn(
                  themeMode === "light" &&
                    "bg-(--primary) text-(--primary-foreground) font-medium hover:bg-(--primary) hover:text-(--primary-foreground)",
                )}
              >
                Light
              </DropdownItem>
              <DropdownItem
                icon={<Moon size={20} />}
                onClick={() => changeTheme("dark")}
                className={cn(
                  themeMode === "dark" &&
                    "bg-(--primary) text-(--primary-foreground) font-medium hover:bg-(--primary) hover:text-(--primary-foreground)",
                )}
              >
                Dark
              </DropdownItem>
              <DropdownItem
                icon={<Monitor size={20} />}
                onClick={() => changeTheme("system")}
                className={cn(
                  themeMode === "system" &&
                    "bg-(--primary) text-(--primary-foreground) font-medium hover:bg-(--primary) hover:text-(--primary-foreground)",
                )}
              >
                System
              </DropdownItem>
            </div>
          </Dropdown>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-(--text-primary)">
            Setup Your Profile
          </h1>
          <p className="text-(--text-secondary)">
            Complete your profile information to get started
          </p>
        </div>

        {/* Profile Picture */}
        <div className="flex justify-center">
          <div className="relative group">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer"
            >
              <div
                className={cn(
                  "h-24 w-24 rounded-full border-2 border-dashed border-(--border) flex items-center justify-center overflow-hidden transition-all duration-200",
                  "group-hover:border-(--primary) group-hover:bg-(--primary)/5",
                )}
              >
                {picturePreview ? (
                  <img
                    src={picturePreview}
                    alt="Profile"
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <User size={36} className="text-(--text-muted)" />
                )}
              </div>
              <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-(--primary) text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Camera size={14} />
              </div>
            </button>
            {picturePreview && (
              <button
                type="button"
                onClick={() => {
                  setPicture(null);
                  setPicturePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-(--bg-panel) border border-(--border) text-(--text-secondary) flex items-center justify-center shadow-sm hover:bg-red-500 hover:text-white hover:border-red-500 transition-all cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePictureChange}
            />
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="font-semibold text-sm">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName && e.target.value.trim())
                    setErrors((p) => ({ ...p, firstName: undefined }));
                }}
                hasError={!!errors.firstName}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="font-semibold text-sm">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName && e.target.value.trim())
                    setErrors((p) => ({ ...p, lastName: undefined }));
                }}
                hasError={!!errors.lastName}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="profileEmail" className="font-semibold text-sm">
                Email
              </Label>
              <Input
                id="profileEmail"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profilePhone" className="font-semibold text-sm">
                Phone
              </Label>
              <Input
                id="profilePhone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth" className="font-semibold text-sm">
                Date of Birth
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sex" className="font-semibold text-sm">
                Sex
              </Label>
              <Select
                id="sex"
                value={sex}
                onChange={(e) => setSex(e.target.value)}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profileAddress" className="font-semibold text-sm">
              Address
            </Label>
            <Input
              id="profileAddress"
              placeholder="123 Main Street"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio" className="font-semibold text-sm">
              Bio
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell us a little about yourself..."
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="pt-4 flex gap-4 justify-end">
            <Button variant="secondary" outline onClick={onBack || onClose}>
              Back
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" variant="pulse" color="white" />
                  Saving...
                </span>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
