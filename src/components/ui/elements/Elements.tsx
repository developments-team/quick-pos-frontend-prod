import { useState } from "react";
import { Button } from "../Button";
import { Input } from "../Input";
import { Combobox } from "../Combobox";
import { DatePicker, type DateRange } from "../DatePicker";
import { Checkbox } from "../Checkbox";
import { RadioGroup, RadioGroupItem } from "../RadioGroup";
import { toast } from "../Toast";
import { FileChooser } from "../FileChooser";
import { ImageChooser } from "../ImageChooser";
import { MultiImageChooser } from "../MultiImageChooser";
import { Search, Lock, User } from "lucide-react";
import { PasswordInput } from "../PasswordInput";
import { SearchableTextbox } from "../SearchableTextbox";

export function Elements() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [radioValue, setRadioValue] = useState("option-1");

  const [comboboxValue1, setComboboxValue1] = useState("");
  const [comboboxValue2, setComboboxValue2] = useState("");
  const [comboboxValue3, setComboboxValue3] = useState("");
  const [comboboxValue4, setComboboxValue4] = useState("");
  const [comboboxValue5, setComboboxValue5] = useState("");
  const [multiSelectValue, setMultiSelectValue] = useState<string[]>([]);
  const [noSearchValue, setNoSearchValue] = useState("");
  const [multiNoSearchValue, setMultiNoSearchValue] = useState<string[]>([]);
  const [searchTextboxValue, setSearchTextboxValue] = useState("");

  const comboboxOptions = [
    { value: "next", label: "Next.js", category: "Frameworks" },
    { value: "react", label: "React", category: "Frameworks" },
    { value: "svelte", label: "Svelte", category: "Frameworks" },
    { value: "vue", label: "Vue", category: "Frameworks" },
    { value: "tailwind", label: "Tailwind CSS", category: "CSS" },
    { value: "bootstrap", label: "Bootstrap", category: "CSS" },
  ];

  return (
    <div className="p-6 space-y-10 pb-20 max-w-4xl mx-auto bg-(--bg-panel)">
      <div>
        <h1 className="text-3xl font-bold text-(--text-primary) mb-2">
          UI Elements
        </h1>
        <p className="text-(--text-secondary)">
          A showcase of all UI components and their variants.
        </p>
      </div>

      {/* Basic Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">
          Basic Buttons
        </h2>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-(--text-secondary)">Default</span>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="info">Info</Button>
            <Button variant="dark">Dark</Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-(--text-secondary)">Rounded</span>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" rounded>
              Primary
            </Button>
            <Button variant="secondary" rounded>
              Secondary
            </Button>
            <Button variant="success" rounded>
              Success
            </Button>
            <Button variant="danger" rounded>
              Danger
            </Button>
            <Button variant="warning" rounded>
              Warning
            </Button>
            <Button variant="info" rounded>
              Info
            </Button>
            <Button variant="dark" rounded>
              Dark
            </Button>
          </div>
        </div>
      </section>

      {/* Label Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">
          Label Buttons
        </h2>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-(--text-secondary)">Default</span>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" label>
              Primary
            </Button>
            <Button variant="secondary" label>
              Secondary
            </Button>
            <Button variant="success" label>
              Success
            </Button>
            <Button variant="danger" label>
              Danger
            </Button>
            <Button variant="warning" label>
              Warning
            </Button>
            <Button variant="info" label>
              Info
            </Button>
            <Button variant="dark" label>
              Dark
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-(--text-secondary)">Rounded</span>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" label rounded>
              Primary
            </Button>
            <Button variant="secondary" label rounded>
              Secondary
            </Button>
            <Button variant="success" label rounded>
              Success
            </Button>
            <Button variant="danger" label rounded>
              Danger
            </Button>
            <Button variant="warning" label rounded>
              Warning
            </Button>
            <Button variant="info" label rounded>
              Info
            </Button>
            <Button variant="dark" label rounded>
              Dark
            </Button>
          </div>
        </div>
      </section>

      {/* Outline Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">
          Outline Buttons
        </h2>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-(--text-secondary)">Default</span>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" outline>
              Primary
            </Button>
            <Button variant="secondary" outline>
              Secondary
            </Button>
            <Button variant="success" outline>
              Success
            </Button>
            <Button variant="danger" outline>
              Danger
            </Button>
            <Button variant="warning" outline>
              Warning
            </Button>
            <Button variant="info" outline>
              Info
            </Button>
            <Button variant="dark" outline>
              Dark
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-(--text-secondary)">Rounded</span>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" outline rounded>
              Primary
            </Button>
            <Button variant="secondary" outline rounded>
              Secondary
            </Button>
            <Button variant="success" outline rounded>
              Success
            </Button>
            <Button variant="danger" outline rounded>
              Danger
            </Button>
            <Button variant="warning" outline rounded>
              Warning
            </Button>
            <Button variant="info" outline rounded>
              Info
            </Button>
            <Button variant="dark" outline rounded>
              Dark
            </Button>
          </div>
        </div>
      </section>

      {/* Text Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">
          Text Buttons
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" ghost>
            Primary
          </Button>
          <Button variant="secondary" ghost>
            Secondary
          </Button>
          <Button variant="success" ghost>
            Success
          </Button>
          <Button variant="danger" ghost>
            Danger
          </Button>
          <Button variant="warning" ghost>
            Warning
          </Button>
          <Button variant="info" ghost>
            Info
          </Button>
          <Button variant="dark" ghost>
            Dark
          </Button>
        </div>
      </section>

      {/* Textbox Groups */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">
          Textbox Groups
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input placeholder="Default Input" />
          <Input placeholder="With Icon" leftIcon={<Search size={16} />} />
          <Input
            placeholder="Left Addon"
            leftAddon={<span className="font-medium">https://</span>}
          />
          <Input
            placeholder="Right Addon"
            rightAddon={<span className="text-xs">.com</span>}
          />
          <Input
            placeholder="Both Addons"
            leftAddon={<User size={16} />}
            rightAddon={
              <Button
                size="sm"
                variant="ghost"
                className="rounded-none h-9.5 rounded-r-md px-2"
              >
                Check
              </Button>
            }
          />
          <Input
            placeholder="Both Addons"
            leftAddon={<User size={16} />}
            rightAddon={
              <Button
                variant="ghost"
                className="rounded-none h-9.5 rounded-r-md px-2"
              >
                Check
              </Button>
            }
          />
          <PasswordInput placeholder="Password" leftIcon={<Lock size={16} />} />
          <PasswordInput
            placeholder="Password"
            rightIcon={<Lock size={16} />}
          />
          <PasswordInput
            placeholder="Password"
            rightIcon={<Lock size={16} />}
          />
        </div>
      </section>

      {/* Password Inputs */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">
          Password Inputs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PasswordInput placeholder="Default (Right Ghost Button)" />
          <PasswordInput
            placeholder="Left Ghost Button"
            togglePosition="left"
            toggleVariant="ghost-button"
          />
          <PasswordInput
            placeholder="Right Icon"
            togglePosition="right"
            toggleVariant="icon"
          />
          <PasswordInput
            placeholder="Left Icon"
            togglePosition="left"
            toggleVariant="icon"
          />
          <PasswordInput
            placeholder="Custom Icons (Lock)"
            showIcon={<Lock size={16} />}
            hideIcon={<Lock size={16} className="opacity-50" />}
            toggleVariant="icon"
          />
          <Combobox
            options={comboboxOptions}
            value={comboboxValue2}
            onChange={setComboboxValue2}
            placeholder="Select action..."
            rightAddon={
              <Button
                variant="ghost"
                className="rounded-none h-9.5 rounded-r-md px-2"
              >
                Go
              </Button>
            }
            rightAddonClassName="p-0 "
          />
          <Combobox
            options={comboboxOptions}
            value={comboboxValue2}
            onChange={setComboboxValue2}
            placeholder="Select action..."
            rightAddon={
              <Button
                variant="ghost"
                className="rounded-none h-9.5 rounded-r-md px-2"
              >
                Go
              </Button>
            }
            rightAddonClassName="p-0 "
          />
          <PasswordInput
            placeholder="With Left Icon & Right Toggle"
            leftIcon={<Lock size={16} />}
          />
          <PasswordInput
            placeholder="Left Lock + Right Eye Icon"
            leftIcon={<Lock size={16} />}
            togglePosition="right"
            toggleVariant="icon"
          />
        </div>
      </section>

      {/* Button Addons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">
          Button Addons
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            placeholder="Search..."
            rightAddon={
              <Button
                variant="primary"
                className="rounded-none h-9.5 rounded-r-md px-4"
              >
                <Search size={16} />
              </Button>
            }
            rightAddonClassName="p-0 bg-transparent"
          />
          <Input
            placeholder="Email Address"
            leftAddon={
              <Button
                variant="secondary"
                className="rounded-none h-9.5 rounded-l-md px-4"
              >
                Subscribe
              </Button>
            }
            leftAddonClassName="p-0 bg-transparent"
          />
          <Combobox
            options={comboboxOptions}
            value={comboboxValue1}
            onChange={setComboboxValue1}
            placeholder="Select action..."
            rightAddon={
              <Button
                variant="primary"
                className="rounded-none h-9.5 rounded-r-md px-4"
              >
                Go
              </Button>
            }
            rightAddonClassName="p-0 bg-transparent"
          />
          <Combobox
            options={comboboxOptions}
            value={comboboxValue2}
            onChange={setComboboxValue2}
            placeholder="Select action..."
            rightAddon={
              <Button
                variant="ghost"
                className="rounded-none h-9.5 rounded-r-md px-2"
              >
                Go
              </Button>
            }
            rightAddonClassName="p-0 "
          />
        </div>
      </section>

      {/* Combobox Groups */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">
          Combobox Groups
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Combobox
            options={comboboxOptions}
            value={comboboxValue3}
            onChange={setComboboxValue3}
            placeholder="Select framework..."
          />
          <Combobox
            options={comboboxOptions}
            value={comboboxValue4}
            onChange={setComboboxValue4}
            placeholder="With Left Addon"
            leftAddon={<span className="text-xs font-medium">Framework</span>}
          />
          <Combobox
            options={comboboxOptions}
            value={comboboxValue5}
            onChange={setComboboxValue5}
            placeholder="With Right Addon"
            rightAddon={<Search size={16} />}
          />
        </div>
      </section>

      {/* Combobox Variants */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">
          Combobox Variants
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Combobox
            options={comboboxOptions}
            value={multiSelectValue}
            onChange={setMultiSelectValue}
            placeholder="Multi-select..."
            multiple
          />
          <Combobox
            options={comboboxOptions}
            value={noSearchValue}
            onChange={setNoSearchValue}
            placeholder="No Search..."
            searchable={false}
          />
          <Combobox
            options={comboboxOptions}
            value={multiNoSearchValue}
            onChange={setMultiNoSearchValue}
            placeholder="Multi-select + No Search..."
            multiple
            searchable={false}
          />
        </div>
      </section>

      {/* Searchable Textbox */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">
          Searchable Textbox
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SearchableTextbox
            options={comboboxOptions}
            value={searchTextboxValue}
            onChange={setSearchTextboxValue}
            placeholder="Search framework..."
          />
          <SearchableTextbox
            options={comboboxOptions}
            value={searchTextboxValue}
            onChange={setSearchTextboxValue}
            placeholder="With Icon & Clear"
            allowClear
            leftIcon={<Search size={16} />}
          />
        </div>
      </section>

      {/* Date Picker */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">
          Date Picker
        </h2>
        <div className="w-full max-w-xs">
          <DatePicker mode="single" value={date} onChange={setDate} />
        </div>
        <h2 className="text-xl font-semibold text-(--text-primary)">
          Date Range Picker
        </h2>
        <div className="w-full max-w-xs">
          <DatePicker mode="range" value={dateRange} onChange={setDateRange} />
        </div>
      </section>

      {/* Checkbox & Radio */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">
          Selection Controls
        </h2>

        {/* Checkboxes */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-(--text-secondary)">
            Checkboxes - Sizes
          </h3>
          <div className="flex flex-wrap items-center gap-6">
            <Checkbox label="Small" size="sm" />
            <Checkbox label="Medium (Default)" size="md" defaultChecked />
            <Checkbox label="Large" size="lg" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-(--text-secondary)">
            Checkboxes - States
          </h3>
          <div className="flex flex-wrap items-center gap-6">
            <Checkbox label="Unchecked" />
            <Checkbox label="Checked" defaultChecked />
            <Checkbox label="Disabled" disabled />
            <Checkbox label="Disabled Checked" disabled defaultChecked />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-(--text-secondary)">
            Checkboxes - Without Labels
          </h3>
          <div className="flex flex-wrap items-center gap-6">
            <Checkbox size="sm" />
            <Checkbox size="md" defaultChecked />
            <Checkbox size="lg" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-(--text-secondary)">
            Checkboxes - Variants
          </h3>
          <div className="flex flex-wrap items-center gap-6">
            <Checkbox
              label="Default (Check)"
              variant="default"
              defaultChecked
            />
            <Checkbox label="Filled" variant="filled" defaultChecked />
          </div>
        </div>

        {/* Radio Buttons */}
        <div className="flex flex-col gap-4 pt-4">
          <h3 className="text-sm font-medium text-(--text-secondary)">
            Radio Buttons - Sizes
          </h3>
          <div className="flex flex-wrap items-center gap-6">
            <RadioGroup
              value={radioValue}
              onValueChange={setRadioValue}
              className="flex gap-6"
            >
              <RadioGroupItem value="small" label="Small" size="sm" />
              <RadioGroupItem value="medium" label="Medium" size="md" />
              <RadioGroupItem value="large" label="Large" size="lg" />
            </RadioGroup>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-(--text-secondary)">
            Radio Buttons - Variants
          </h3>
          <div className="flex flex-wrap items-center gap-6">
            <RadioGroup value="filled" className="flex gap-6">
              <RadioGroupItem
                value="default"
                label="Default (Dot)"
                variant="default"
              />
              <RadioGroupItem value="filled" label="Filled" variant="filled" />
            </RadioGroup>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-(--text-secondary)">
            Radio Buttons - States
          </h3>
          <div className="flex flex-wrap items-center gap-6">
            <RadioGroup value="option-2" className="flex gap-6">
              <RadioGroupItem value="option-1" label="Unselected" />
              <RadioGroupItem value="option-2" label="Selected" />
              <RadioGroupItem value="option-3" label="Disabled" disabled />
            </RadioGroup>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-(--text-secondary)">
            Radio Buttons - Without Labels
          </h3>
          <div className="flex flex-wrap items-center gap-6">
            <RadioGroup value="radio-md" className="flex gap-6">
              <RadioGroupItem value="radio-sm" size="sm" />
              <RadioGroupItem value="radio-md" size="md" />
              <RadioGroupItem value="radio-lg" size="lg" />
            </RadioGroup>
          </div>
        </div>
      </section>

      {/* Toasts */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">Toasts</h2>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() =>
              toast.success("Operation completed successfully.", {
                title: "Success",
                duration: 5000,
              })
            }
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Success Toast
          </Button>
          <Button
            onClick={() =>
              toast.error("Something went wrong.", {
                title: "Error",
                duration: 5000,
              })
            }
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Error Toast
          </Button>
          <Button
            onClick={() =>
              toast.warning("Please check your input.", {
                title: "Warning",
                duration: 5000,
              })
            }
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Warning Toast
          </Button>
          <Button
            onClick={() =>
              toast.info("Here is some useful information.", {
                title: "Info",
                duration: 5000,
              })
            }
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Info Toast
          </Button>
        </div>
      </section>

      {/* File & Image Choosers */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">
          File Inputs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-(--text-secondary)">
              File Chooser
            </h3>
            <FileChooser />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-(--text-secondary)">
              Image Chooser
            </h3>
            <ImageChooser />
          </div>
          <div className="space-y-2 md:col-span-2">
            <h3 className="text-sm font-medium text-(--text-secondary)">
              Multi Image Chooser
            </h3>
            <MultiImageChooser />
          </div>
        </div>
      </section>
    </div>
  );
}
