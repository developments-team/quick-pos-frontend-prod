import { useState } from "react";
import { Button } from "../Button";
import { Input } from "../Input";
import { Modal } from "../Modal";
import { Search, Bell, Settings, User, Star, Heart, Send } from "lucide-react";
import { Spinner } from "../Spinner";

export function AdvancedElements() {
  const [isXsModalOpen, setIsXsModalOpen] = useState(false);
  const [isSmallModalOpen, setIsSmallModalOpen] = useState(false);
  const [isMediumModalOpen, setIsMediumModalOpen] = useState(false);
  const [isLargeModalOpen, setIsLargeModalOpen] = useState(false);
  const [isXLModalOpen, setIsXLModalOpen] = useState(false);
  const [isXXLModalOpen, setIsXXLModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [showFadeMenu, setShowFadeMenu] = useState(false);
  const [showFadeContent, setShowFadeContent] = useState(false);

  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);

  return (
    <div className="p-6 space-y-10 pb-20 max-w-6xl mx-auto bg-(--bg-panel) min-h-screen text-(--text-primary)">
      <div>
        <h1 className="text-3xl font-bold mb-2">Advanced Elements</h1>
        <p className="text-(--text-secondary)">
          Showcasing different sizes, animations, and interactive states.
        </p>
      </div>

      {/* Modals Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b border-(--border) pb-2">
          Modals & Overlays
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-3">Modal Sizes</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setIsXsModalOpen(true)}
                variant="secondary"
                outline
                size="sm"
              >
                XS Modal
              </Button>
              <Button
                onClick={() => setIsSmallModalOpen(true)}
                variant="secondary"
                outline
                size="sm"
              >
                SM Modal
              </Button>
              <Button
                onClick={() => setIsMediumModalOpen(true)}
                variant="secondary"
                outline
              >
                MD Modal
              </Button>
              <Button
                onClick={() => setIsLargeModalOpen(true)}
                variant="secondary"
                outline
              >
                LG Modal
              </Button>
              <Button
                onClick={() => setIsXLModalOpen(true)}
                variant="secondary"
                outline
              >
                XL Modal
              </Button>
              <Button onClick={() => setIsXXLModalOpen(true)} variant="primary">
                XXL Modal
              </Button>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">Special Modals</h3>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setIsDrawerOpen(true)} variant="secondary">
                Right Drawer
              </Button>
              <Button
                onClick={() => setIsBottomSheetOpen(true)}
                variant="secondary"
              >
                Bottom Sheet
              </Button>
            </div>
          </div>
        </div>

        <Modal
          isOpen={isXsModalOpen}
          onClose={() => setIsXsModalOpen(false)}
          title="Extra Small Modal (XS)"
          size="xs"
        >
          <p className="text-sm">
            This is the smallest modal size, perfect for quick confirmations.
          </p>
          <div className="mt-4 flex justify-end">
            <Button size="sm" onClick={() => setIsXsModalOpen(false)}>
              Close
            </Button>
          </div>
        </Modal>

        <Modal
          isOpen={isSmallModalOpen}
          onClose={() => setIsSmallModalOpen(false)}
          title="Small Modal (SM)"
          size="sm"
        >
          <p>
            This is a small modal suitable for quick confirmations or alerts.
          </p>
          <div className="mt-4 flex justify-end">
            <Button size="sm" onClick={() => setIsSmallModalOpen(false)}>
              Close
            </Button>
          </div>
        </Modal>

        <Modal
          isOpen={isMediumModalOpen}
          onClose={() => setIsMediumModalOpen(false)}
          title="Medium Modal (MD)"
          size="md"
        >
          <p>
            This is the default medium modal. It works well for forms and
            standard content.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsMediumModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsMediumModalOpen(false)}>Confirm</Button>
          </div>
        </Modal>

        <Modal
          isOpen={isLargeModalOpen}
          onClose={() => setIsLargeModalOpen(false)}
          title="Large Modal (LG)"
          size="lg"
        >
          <p>
            Large modals are great for displaying detailed information, data
            tables, or complex forms.
          </p>
          <div className="h-40 bg-(--bg-panel) rounded-md mt-4 flex items-center justify-center border border-(--border)">
            Placeholder Content
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setIsLargeModalOpen(false)}>Done</Button>
          </div>
        </Modal>

        <Modal
          isOpen={isXLModalOpen}
          onClose={() => setIsXLModalOpen(false)}
          title="Extra Large Modal (XL)"
          size="xl"
        >
          <p>This is an extra large modal for displaying extensive content.</p>
          <div className="grid grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-24 bg-(--bg-panel) rounded-md border border-(--border)"
              />
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setIsXLModalOpen(false)}>Done</Button>
          </div>
        </Modal>

        <Modal
          isOpen={isXXLModalOpen}
          onClose={() => setIsXXLModalOpen(false)}
          title="Double Extra Large Modal (XXL)"
          size="2xl"
        >
          <p>
            This is the largest modal size, ideal for immersive content and
            complex layouts.
          </p>
          <div className="grid grid-cols-6 gap-4 mt-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div
                key={i}
                className="h-24 bg-(--bg-panel) rounded-md border border-(--border)"
              />
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setIsXXLModalOpen(false)}>Done</Button>
          </div>
        </Modal>

        <Modal
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title="Right Drawer"
          className="fixed right-0 top-0 bottom-0 h-full w-80 m-0 rounded-none rounded-l-lg"
        >
          <p>This modal acts as a side drawer, sliding in from the right.</p>
          <div className="mt-4 flex flex-col gap-2">
            <Button
              variant="secondary"
              outline
              className="w-full justify-start"
            >
              Navigation Item 1
            </Button>
            <Button
              variant="secondary"
              outline
              className="w-full justify-start"
            >
              Navigation Item 2
            </Button>
            <Button
              variant="secondary"
              outline
              className="w-full justify-start"
            >
              Navigation Item 3
            </Button>
          </div>
          <div className="mt-auto pt-4 flex justify-end">
            <Button onClick={() => setIsDrawerOpen(false)}>Close</Button>
          </div>
        </Modal>

        <Modal
          isOpen={isBottomSheetOpen}
          onClose={() => setIsBottomSheetOpen(false)}
          title="Bottom Sheet"
          className="fixed bottom-0 left-0 right-0 w-full max-w-none m-0 rounded-none rounded-t-xl"
        >
          <p>This modal acts as a bottom sheet, sliding up from the bottom.</p>
          <div className="h-32 bg-(--bg-panel) rounded-md mt-4 flex items-center justify-center border border-(--border)">
            Sheet Content
          </div>
          <div className="mt-4 flex justify-end w-full">
            <Button
              onClick={() => setIsBottomSheetOpen(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </div>
        </Modal>
      </section>

      {/* Buttons Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b border-(--border) pb-2">
          Buttons & Interactions
        </h2>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Sizes</h3>
          <div className="flex flex-wrap items-end gap-4">
            <Button size="sm">Small Button</Button>
            <Button size="md">Medium Button</Button>
            <Button size="lg">Large Button</Button>
            <Button size="icon">
              <Settings />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Animations & States</h3>
          <div className="flex flex-wrap gap-4">
            <Button className="hover:scale-105 transition-transform">
              Scale on Hover
            </Button>
            <Button
              className="hover:rotate-3 transition-transform"
              variant="secondary"
            >
              Rotate on Hover
            </Button>
            <Button
              className="hover:-translate-y-1 transition-transform"
              variant="secondary"
              outline
            >
              Lift on Hover
            </Button>
            <Button className="animate-pulse" variant="danger">
              Pulse Effect
            </Button>
            <Button className="group relative overflow-hidden">
              <span className="relative z-10">Shine Effect</span>
              <div className="absolute inset-0 h-full w-full scale-0 rounded-md transition-all duration-300 group-hover:scale-100 group-hover:bg-white/20"></div>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Icon Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors"
            >
              <Bell />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
            >
              <Heart />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-yellow-100 hover:text-yellow-600 transition-colors"
            >
              <Star />
            </Button>
          </div>
        </div>
      </section>

      {/* Inputs Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b border-(--border) pb-2">
          Inputs & Forms
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sizes (via ClassName)</h3>
            <div className="space-y-4">
              <Input placeholder="Small Input" className="h-8 text-xs" />
              <Input placeholder="Default Input (Medium)" />
              <Input placeholder="Large Input" className="h-12 text-lg" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Interactive States</h3>
            <div className="space-y-4">
              <Input
                placeholder="Focus to expand..."
                className="transition-all duration-300 focus:w-[105%]"
              />
              <Input
                placeholder="With animated icon..."
                rightIcon={
                  <Send
                    size={16}
                    className="group-focus-within:translate-x-1 transition-transform duration-300 text-blue-500"
                  />
                }
              />
              <Input
                placeholder="Search with hover effect..."
                leftIcon={<Search size={16} />}
                className="hover:shadow-md transition-shadow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b border-(--border) pb-2">
          Cards & Containers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-(--border) bg-(--bg-card) hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <User size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Profile Card</h3>
            <p className="text-(--text-secondary)">
              Hover to see the lift and shadow effect.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-(--border) bg-(--bg-card) hover:border-blue-500 transition-colors duration-300 cursor-pointer group">
            <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
              <Star size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Feature Card</h3>
            <p className="text-(--text-secondary)">
              Hover to see the border color change.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-(--border) bg-linear-to-br from-blue-500 to-purple-600 text-white transform transition-all duration-500 hover:scale-105 cursor-pointer">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
              <Heart size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Gradient Card</h3>
            <p className="text-white/80">
              A beautiful gradient card with scale effect.
            </p>
          </div>
        </div>
      </section>

      {/* Animations & Menus Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b border-(--border) pb-2">
          Animations & Menus
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Fade Menu Example */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Fade In/Out Menu</h3>
            <div className="relative">
              <Button
                onClick={() => setShowFadeMenu(!showFadeMenu)}
                variant="secondary"
                outline
                className="w-40 justify-between"
              >
                Toggle Menu
                <span className="ml-2">▼</span>
              </Button>
              {showFadeMenu && (
                <div className="absolute top-full left-0 mt-2 w-56 rounded-md border border-(--border) bg-(--bg-card) shadow-lg animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-1">
                    <div className="px-2 py-1.5 text-sm hover:bg-(--bg-panel) rounded cursor-pointer">
                      Profile
                    </div>
                    <div className="px-2 py-1.5 text-sm hover:bg-(--bg-panel) rounded cursor-pointer">
                      Settings
                    </div>
                    <div className="px-2 py-1.5 text-sm hover:bg-(--bg-panel) rounded cursor-pointer">
                      Logout
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-(--text-secondary)">
              Click to see the menu fade and zoom in.
            </p>
          </div>

          {/* Fade Content Example */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Fade Content Toggle</h3>
            <Button
              onClick={() => setShowFadeContent(!showFadeContent)}
              variant="secondary"
            >
              {showFadeContent ? "Hide Content" : "Show Content"}
            </Button>

            <div className="h-32 relative">
              {showFadeContent && (
                <div className="absolute inset-0 p-4 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-500 animate-in fade-in slide-in-from-top-4 duration-500">
                  <h4 className="font-semibold mb-1">Fade In Content</h4>
                  <p className="text-sm">
                    This content fades in and slides down when toggled. It uses{" "}
                    <code>animate-in fade-in slide-in-from-top-4</code>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Alert Dialogs Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b border-(--border) pb-2">
          Alert Dialogs
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => setIsAlertDialogOpen(true)}
            variant="secondary"
            outline
          >
            Show Dialog
          </Button>
        </div>

        <Modal
          isOpen={isAlertDialogOpen}
          onClose={() => setIsAlertDialogOpen(false)}
          hideClose
          size="sm"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                Are you absolutely sure?
              </h3>
              <p className="text-sm text-(--text-secondary)">
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                outline
                onClick={() => setIsAlertDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  console.log("Confirmed");
                  setIsAlertDialogOpen(false);
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        </Modal>
      </section>

      {/* Spinners & Loaders Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b border-(--border) pb-2">
          Spinners & Loaders
        </h2>

        {/* Spinner Variants */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Variants</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="spinner" size="lg" />
              <span className="text-sm text-(--text-secondary)">Spinner</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="dots" size="lg" />
              <span className="text-sm text-(--text-secondary)">Dots</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="pulse" size="lg" />
              <span className="text-sm text-(--text-secondary)">Pulse</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="ring" size="lg" />
              <span className="text-sm text-(--text-secondary)">Ring</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="bars" size="lg" />
              <span className="text-sm text-(--text-secondary)">Bars</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="wave" size="lg" />
              <span className="text-sm text-(--text-secondary)">Wave</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="orbit" size="lg" />
              <span className="text-sm text-(--text-secondary)">Orbit</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="square" size="lg" />
              <span className="text-sm text-(--text-secondary)">Square</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="bounce" size="lg" />
              <span className="text-sm text-(--text-secondary)">Bounce</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="fade" size="lg" />
              <span className="text-sm text-(--text-secondary)">Fade</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="dual-ring" size="lg" />
              <span className="text-sm text-(--text-secondary)">Dual Ring</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="ripple" size="lg" />
              <span className="text-sm text-(--text-secondary)">Ripple</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="circle-dots" size="lg" />
              <span className="text-sm text-(--text-secondary)">
                Circle Dots
              </span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="gradient-ring" size="lg" />
              <span className="text-sm text-(--text-secondary)">
                Gradient Ring
              </span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="ring-chase" size="lg" />
              <span className="text-sm text-(--text-secondary)">
                Ring Chase
              </span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="ping" size="lg" />
              <span className="text-sm text-(--text-secondary)">Ping</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="ring-scale" size="lg" />
              <span className="text-sm text-(--text-secondary)">
                Ring Scale
              </span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="circular" size="lg" />
              <span className="text-sm text-(--text-secondary)">Circular</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="circular-track" size="lg" />
              <span className="text-sm text-(--text-secondary)">
                Circular Track
              </span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="classic" size="lg" />
              <span className="text-sm text-(--text-secondary)">Classic</span>
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Sizes</h3>
          <div className="flex flex-wrap items-end gap-8">
            <div className="flex flex-col items-center gap-2">
              <Spinner variant="ring" size="sm" color="primary" />
              <span className="text-xs text-(--text-secondary)">SM</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Spinner variant="ring" size="md" color="primary" />
              <span className="text-xs text-(--text-secondary)">MD</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Spinner variant="ring" size="lg" color="primary" />
              <span className="text-xs text-(--text-secondary)">LG</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Spinner variant="ring" size="xl" color="primary" />
              <span className="text-xs text-(--text-secondary)">XL</span>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Colors</h3>
          <div className="flex flex-wrap gap-8">
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="dots" size="lg" color="default" />
              <span className="text-xs text-(--text-secondary)">Default</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-(--border) bg-(--bg-card)">
              <Spinner variant="dots" size="lg" color="primary" />
              <span className="text-xs text-(--text-secondary)">Primary</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-800">
              <Spinner variant="dots" size="lg" color="white" />
              <span className="text-xs text-white/70">White</span>
            </div>
          </div>
        </div>

        {/* All Combinations Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            All Combinations (Primary Color)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--border)">
                  <th className="text-left py-2 px-3 font-medium">Variant</th>
                  <th className="text-center py-2 px-3 font-medium">XS</th>
                  <th className="text-center py-2 px-3 font-medium">SM</th>
                  <th className="text-center py-2 px-3 font-medium">MD</th>
                  <th className="text-center py-2 px-3 font-medium">LG</th>
                  <th className="text-center py-2 px-3 font-medium">XL</th>
                  <th className="text-center py-2 px-3 font-medium">2XL</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    "spinner",
                    "dots",
                    "pulse",
                    "ring",
                    "bars",
                    "wave",
                    "orbit",
                    "square",
                    "bounce",
                    "fade",
                    "dual-ring",
                    "ripple",
                    "circle-dots",
                    "gradient-ring",
                    "ring-chase",
                    "ping",
                    "ring-scale",
                    "circular",
                    "circular-track",
                    "classic",
                  ] as const
                ).map((variant) => (
                  <tr key={variant} className="border-b border-(--border)">
                    <td className="py-3 px-3 capitalize font-medium">
                      {variant}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Spinner variant={variant} size="xs" color="primary" />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Spinner variant={variant} size="sm" color="primary" />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Spinner variant={variant} size="md" color="primary" />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Spinner variant={variant} size="lg" color="primary" />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Spinner variant={variant} size="xl" color="primary" />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Spinner variant={variant} size="2xl" color="primary" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Usage in Buttons */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Loading Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <Button disabled className="min-w-32">
              <Spinner variant="spinner" size="sm" className="mr-2" />
              Loading...
            </Button>
            <Button disabled variant="secondary" className="min-w-32">
              <Spinner
                variant="dots"
                size="sm"
                color="primary"
                className="mr-2"
              />
              Processing
            </Button>
            <Button disabled variant="secondary" outline className="min-w-32">
              <Spinner variant="ring" size="sm" className="mr-2" />
              Saving...
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
