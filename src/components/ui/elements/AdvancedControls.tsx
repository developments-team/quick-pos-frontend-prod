import { useState } from "react";
import { Button } from "../Button";
import { Card } from "../Card";
import { Modal } from "../Modal";
import { toast } from "../Toast";
import { Progress } from "../Progress";
import { Spinner } from "../Spinner";
import { Combobox } from "../Combobox";
import { Select } from "../Select";
import { DataTable, type Column } from "../DataTable";
import { Badge } from "../Badge";
import { Package } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export function AdvancedControls() {
  const [modalOpen, setModalOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const [progress, setProgress] = useState(45);
  const [comboboxValue, setComboboxValue] = useState("");
  const [countryValue, setCountryValue] = useState("");
  const [categoryValue, setCategoryValue] = useState("");
  const [languageValue, setLanguageValue] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [colorValue, setColorValue] = useState("");

  // DataTable Data
  const users: User[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      status: "Active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "User",
      status: "Inactive",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "Editor",
      status: "Active",
    },
    {
      id: 4,
      name: "Alice Brown",
      email: "alice@example.com",
      role: "User",
      status: "Active",
    },
    {
      id: 5,
      name: "Charlie Wilson",
      email: "charlie@example.com",
      role: "Admin",
      status: "Inactive",
    },
    {
      id: 6,
      name: "Diana Evans",
      email: "diana@example.com",
      role: "User",
      status: "Active",
    },
    {
      id: 7,
      name: "Evan Wright",
      email: "evan@example.com",
      role: "Editor",
      status: "Active",
    },
    {
      id: 8,
      name: "Fiona Clark",
      email: "fiona@example.com",
      role: "User",
      status: "Inactive",
    },
    {
      id: 9,
      name: "George Hill",
      email: "george@example.com",
      role: "Admin",
      status: "Active",
    },
    {
      id: 10,
      name: "Hannah Scott",
      email: "hannah@example.com",
      role: "User",
      status: "Active",
    },
  ];

  const columns: Column<User>[] = [
    { header: "ID", accessorKey: "id", sortable: true },
    { header: "Name", accessorKey: "name", sortable: true, searchable: true },
    { header: "Email", accessorKey: "email", sortable: true },
    { header: "Role", accessorKey: "role", sortable: true },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (item: User) => (
        <Badge variant={item.status === "Active" ? "success" : "secondary"}>
          {item.status}
        </Badge>
      ),
    },
  ];

  // Simple frameworks list (searchable)
  const frameworks = [
    { value: "next.js", label: "Next.js" },
    { value: "sveltekit", label: "SvelteKit" },
    { value: "nuxt.js", label: "Nuxt.js" },
    { value: "remix", label: "Remix" },
    { value: "astro", label: "Astro" },
    { value: "gatsby", label: "Gatsby" },
    { value: "vite", label: "Vite" },
  ];

  // Countries with descriptions and badges
  const countries = [
    {
      value: "us",
      label: "United States",
      description: "North America",
      badge: "Popular",
    },
    {
      value: "uk",
      label: "United Kingdom",
      description: "Europe",
      badge: "Popular",
    },
    {
      value: "ca",
      label: "Canada",
      description: "North America",
    },
    {
      value: "au",
      label: "Australia",
      description: "Oceania",
    },
    {
      value: "de",
      label: "Germany",
      description: "Europe",
      badge: "EU",
    },
    {
      value: "fr",
      label: "France",
      description: "Europe",
      badge: "EU",
    },
    {
      value: "jp",
      label: "Japan",
      description: "Asia",
    },
    {
      value: "cn",
      label: "China",
      description: "Asia",
    },
  ];

  // Categorized product categories
  const productCategories = [
    {
      value: "electronics-phones",
      label: "Smartphones",
      category: "Electronics",
      description: "Mobile phones and accessories",
    },
    {
      value: "electronics-laptops",
      label: "Laptops",
      category: "Electronics",
      description: "Portable computers",
    },
    {
      value: "electronics-tablets",
      label: "Tablets",
      category: "Electronics",
      description: "Touch screen devices",
    },
    {
      value: "clothing-men",
      label: "Men's Clothing",
      category: "Clothing",
      badge: "New",
    },
    {
      value: "clothing-women",
      label: "Women's Clothing",
      category: "Clothing",
      badge: "New",
    },
    {
      value: "clothing-kids",
      label: "Kids' Clothing",
      category: "Clothing",
    },
    {
      value: "home-furniture",
      label: "Furniture",
      category: "Home & Living",
      description: "Tables, chairs, sofas",
    },
    {
      value: "home-decor",
      label: "Home Decor",
      category: "Home & Living",
      description: "Wall art, vases, etc.",
    },
  ];

  // Large list for testing scrolling
  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "it", label: "Italian" },
    { value: "pt", label: "Portuguese" },
    { value: "ru", label: "Russian" },
    { value: "ja", label: "Japanese" },
    { value: "ko", label: "Korean" },
    { value: "zh", label: "Chinese" },
    { value: "ar", label: "Arabic" },
    { value: "hi", label: "Hindi" },
    { value: "bn", label: "Bengali" },
    { value: "pa", label: "Punjabi" },
    { value: "jv", label: "Javanese" },
    { value: "vi", label: "Vietnamese" },
    { value: "tr", label: "Turkish" },
    { value: "pl", label: "Polish" },
    { value: "uk", label: "Ukrainian" },
    { value: "nl", label: "Dutch" },
  ];

  // Simple lists for non-searchable selects
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const colors = [
    { value: "red", label: "Red" },
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "yellow", label: "Yellow" },
    { value: "purple", label: "Purple" },
    { value: "orange", label: "Orange" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-(--text-primary)">
          Advanced Controls
        </h1>
        <p className="text-(--text-muted) mt-2">
          Complex UI components including modals, toasts, data tables, and more.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Modals & Alerts */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-medium text-(--text-primary)">
            Modals & Alerts
          </h3>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          </div>
        </Card>

        {/* Toasts */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-medium text-(--text-primary)">Toasts</h3>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="secondary"
              outline
              onClick={() =>
                toast.success("Operation completed successfully.", {
                  title: "Success",
                })
              }
            >
              Success
            </Button>
            <Button
              variant="secondary"
              outline
              onClick={() =>
                toast.error("Something went wrong.", {
                  title: "Error",
                })
              }
            >
              Error
            </Button>
            <Button
              variant="secondary"
              outline
              onClick={() =>
                toast.info("Here is some useful information.", {
                  title: "Info",
                })
              }
            >
              Info
            </Button>
            <Button
              variant="secondary"
              outline
              onClick={() =>
                toast.warning("Please be careful.", {
                  title: "Warning",
                })
              }
            >
              Warning
            </Button>
          </div>
        </Card>

        {/* Progress & Spinners */}
        <Card className="p-6 space-y-6">
          <h3 className="text-lg font-medium text-(--text-primary)">
            Progress & Loading
          </h3>
          <div className="space-y-4">
            <Progress value={progress} showLabel />
            <Progress value={75} variant="success" size="sm" />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                outline
                onClick={() => setProgress((p) => Math.max(0, p - 10))}
              >
                -10%
              </Button>
              <Button
                size="sm"
                variant="secondary"
                outline
                onClick={() => setProgress((p) => Math.min(100, p + 10))}
              >
                +10%
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <Spinner size="sm" />
            <Spinner />
            <Spinner size="lg" />
            <Spinner size="xl" />
          </div>
        </Card>
      </div>

      {/* Combobox & Select Variants */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-(--text-primary)">
            Dropdown Variants
          </h2>
          <p className="text-(--text-muted) mt-1">
            Searchable (Combobox) and non-searchable (Select) dropdown
            components
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Searchable Combobox */}
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-medium text-(--text-primary)">
                Basic Searchable
              </h3>
              <p className="text-sm text-(--text-secondary) mt-1">
                Simple searchable dropdown with clear functionality
              </p>
            </div>
            <div className="space-y-2">
              <Combobox
                options={frameworks}
                value={comboboxValue}
                onChange={setComboboxValue}
                placeholder="Select framework..."
                allowClear
              />
              <p className="text-xs text-(--text-secondary)">
                Selected:{" "}
                <span className="font-medium">{comboboxValue || "None"}</span>
              </p>
            </div>
          </Card>

          {/* With Badges and Descriptions */}
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-medium text-(--text-primary)">
                With Badges & Descriptions
              </h3>
              <p className="text-sm text-(--text-secondary) mt-1">
                Rich options with additional context
              </p>
            </div>
            <div className="space-y-2">
              <Combobox
                options={countries}
                value={countryValue}
                onChange={setCountryValue}
                placeholder="Select country..."
                allowClear
                showBadges
              />
              <p className="text-xs text-(--text-secondary)">
                Selected:{" "}
                <span className="font-medium">{countryValue || "None"}</span>
              </p>
            </div>
          </Card>

          {/* Categorized Options */}
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-medium text-(--text-primary)">
                Categorized Options
              </h3>
              <p className="text-sm text-(--text-secondary) mt-1">
                Options grouped by category
              </p>
            </div>
            <div className="space-y-2">
              <Combobox
                options={productCategories}
                value={categoryValue}
                onChange={setCategoryValue}
                placeholder="Select category..."
                allowClear
                showBadges
              />
              <p className="text-xs text-(--text-secondary)">
                Selected:{" "}
                <span className="font-medium">{categoryValue || "None"}</span>
              </p>
            </div>
          </Card>

          {/* Large List with Scrolling */}
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-medium text-(--text-primary)">
                Large List (Scrollable)
              </h3>
              <p className="text-sm text-(--text-secondary) mt-1">
                Many options with search and scroll
              </p>
            </div>
            <div className="space-y-2">
              <Combobox
                options={languages}
                value={languageValue}
                onChange={setLanguageValue}
                placeholder="Select language..."
                allowClear
              />
              <p className="text-xs text-(--text-secondary)">
                Selected:{" "}
                <span className="font-medium">{languageValue || "None"}</span>
              </p>
            </div>
          </Card>

          {/* Non-Searchable Select - Basic */}
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-medium text-(--text-primary)">
                Non-Searchable Select
              </h3>
              <p className="text-sm text-(--text-secondary) mt-1">
                Simple dropdown without search functionality
              </p>
            </div>
            <div className="space-y-2">
              <Select
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
              >
                <option value="">Select size...</option>
                {sizes.map((size) => (
                  <option key={size} value={size.toLowerCase()}>
                    {size}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-(--text-secondary)">
                Selected:{" "}
                <span className="font-medium">{selectValue || "None"}</span>
              </p>
            </div>
          </Card>

          {/* Non-Searchable Select - With Icons */}
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-medium text-(--text-primary)">
                Non-Searchable (With Icon)
              </h3>
              <p className="text-sm text-(--text-secondary) mt-1">
                Native select with icon support
              </p>
            </div>
            <div className="space-y-2">
              <Select
                value={colorValue}
                onChange={(e) => setColorValue(e.target.value)}
                icon={<Package className="h-4 w-4" />}
              >
                <option value="">Select color...</option>
                {colors.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.label}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-(--text-secondary)">
                Selected:{" "}
                <span className="font-medium">{colorValue || "None"}</span>
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* DataTable */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-medium text-(--text-primary)">DataTable</h3>
        <DataTable
          data={users}
          columns={columns}
          pageSizeOptions={[
            { value: "5", label: "5" },
            { value: "10", label: "10" },
            { value: "20", label: "20" },
            { value: "50", label: "50" },
            { value: "100", label: "100" },
          ]}
        />
      </Card>

      {/* Modal Component */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Example Modal"
      >
        <div className="space-y-4">
          <p className="text-(--text-secondary)">
            This is a reusable modal component. You can put any content here.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>Continue</Button>
          </div>
        </div>
      </Modal>

      {/* Alert Dialog Example using Modal */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-medium text-(--text-primary)">
          Alert Dialog (using Modal)
        </h3>
        <p className="text-sm text-(--text-secondary)">
          A modal dialog that interrupts the user with important content and
          expects a response.
        </p>
        <Button variant="danger" onClick={() => setAlertOpen(true)}>
          Delete Account
        </Button>

        <Modal
          isOpen={alertOpen}
          onClose={() => setAlertOpen(false)}
          title="Are you absolutely sure?"
          size="sm"
          hideClose
        >
          <div className="space-y-4">
            <p className="text-sm text-(--text-muted)">
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button
                variant="secondary"
                outline
                onClick={() => setAlertOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setAlertOpen(false);
                  toast.success("Account deleted successfully", {
                    title: "Deleted",
                  });
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        </Modal>
      </Card>
    </div>
  );
}
