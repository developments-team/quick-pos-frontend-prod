import React, { useState } from "react";
import { Button } from "../Button";
import { Input } from "../Input";
import { Label } from "../Label";
import { Textarea } from "../Textarea";
import { Checkbox } from "../Checkbox";
import { Switch } from "../Switch";
import { RadioGroup, RadioGroupItem, CardRadioGroupItem } from "../RadioGroup";
import { Select } from "../Select";
import { Badge } from "../Badge";
import { Alert } from "../Alert";
import { Tab } from "../Tab";
import { ChipSelector } from "../ChipSelector";
import {
  Wizard,
  WizardList,
  WizardStep,
  WizardContent,
  WizardFooter,
} from "../Wizard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../Table";
import { Card } from "../Card";
import {
  Mail,
  Search,
  User,
  Check,
  AlertTriangle,
  X,
  Box,
  Layers,
  Palette,
  Hash,
  Weight,
  Component,
  CreditCard,
  CheckCircle,
  Wallet,
} from "lucide-react";

export function DesignSystem() {
  const [tabValue, setTabValue] = React.useState("retail");
  const [categoryTabValue, setCategoryTabValue] = React.useState("clothing");
  const [chipValue, setChipValue] = React.useState<string | string[]>([]);

  const [radioValue, setRadioValue] = useState("standard");
  const [simpleWizardStep, setSimpleWizardStep] = useState(0);
  const [connectedLineStep, setConnectedLineStep] = useState(1);
  const [chevronWizardStep, setChevronWizardStep] = useState(0);
  const [iconWizardStep, setIconWizardStep] = useState(0);
  const [compactWizardStep, setCompactWizardStep] = useState(0);
  const [progressWizardStep, setProgressWizardStep] = useState(0);
  const [centeredIndicatorStep, setCenteredIndicatorStep] = useState(0);
  const [verticalWizardStep, setVerticalWizardStep] = useState(0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-(--text-primary)">
          Design System
        </h1>
        <p className="text-(--text-muted) mt-2">
          A collection of all form controls and UI components used in the
          application.
        </p>
      </div>

      {/* New Product Components */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">
          New Product Components
        </h2>

        <Card className="p-6 space-y-8">
          {/* Toggle / Segmented Control */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-(--text-primary)">
              Retail / Wholesale Toggle
            </h3>
            <Tab
              variant="primary"
              options={[
                { label: "Retail", value: "retail", icon: <Box size={16} /> },
                {
                  label: "Wholesale",
                  value: "wholesale",
                  icon: <Layers size={16} />,
                },
              ]}
              value={tabValue}
              onChange={setTabValue}
            />
          </div>

          {/* Category Tabs */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-(--text-primary)">
              Category Selection
            </h3>
            <Tab
              options={[
                {
                  label: "Clothing",
                  value: "clothing",
                  icon: <User size={16} />,
                },
                {
                  label: "Electronics",
                  value: "electronics",
                  icon: <Component size={16} />,
                },
                { label: "Home", value: "home", icon: <Box size={16} /> },
                {
                  label: "Sports",
                  value: "sports",
                  icon: <Layers size={16} />,
                },
              ]}
              value={categoryTabValue}
              onChange={setCategoryTabValue}
            />
          </div>

          {/* Card Radio Group */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-(--text-primary)">
              Product Type Selection
            </h3>
            <RadioGroup
              defaultValue="standard"
              className="grid-cols-1 md:grid-cols-2 gap-4"
              value={radioValue}
              onValueChange={setRadioValue}
            >
              <CardRadioGroupItem
                value="standard"
                title="Standard"
                description="A single product without simple variations"
                icon={<Box />}
              />
              <CardRadioGroupItem
                value="variant"
                title="Variant"
                description="Product with size, color options"
                icon={<Layers />}
              />
            </RadioGroup>
          </div>

          {/* Variant Attributes Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-(--text-primary)">
              Variant Attributes
            </h3>
            <ChipSelector
              multiple
              value={chipValue}
              onChange={(val) => setChipValue(val)}
              options={[
                { label: "Color", value: "color", icon: <Palette size={16} /> },
                { label: "Size", value: "size", icon: <Hash size={16} /> },
                {
                  label: "Weight",
                  value: "weight",
                  icon: <Weight size={16} />,
                },
                {
                  label: "Material",
                  value: "material",
                  icon: <Component size={16} />,
                },
              ]}
            />
          </div>
        </Card>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="secondary" outline>
            Outline
          </Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">
            <User size={20} />
          </Button>
        </div>
      </section>

      {/* Form Controls */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">
          Form Controls
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Inputs */}
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-medium text-(--text-primary)">
              Inputs
            </h3>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                leftIcon={<Mail size={18} />}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search..."
                leftIcon={<Search size={18} />}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disabled">Disabled Input</Label>
              <Input id="disabled" placeholder="Disabled" disabled />
            </div>
          </Card>

          {/* Textarea & Select */}
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-medium text-(--text-primary)">
              Textarea & Select
            </h3>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Type your message here..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select id="role">
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="manager">Manager</option>
              </Select>
            </div>
          </Card>

          {/* Checkbox, Radio, Switch */}
          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-medium text-(--text-primary)">
              Selection Controls
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label>Checkboxes</Label>
                <Checkbox label="Accept terms and conditions" />
                <Checkbox label="Subscribe to newsletter" defaultChecked />
                <Checkbox label="Disabled option" disabled />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Switches</Label>
                <Switch label="Airplane Mode" />
                <Switch label="Dark Mode" defaultChecked />
                <Switch label="Bluetooth" disabled />
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-medium text-(--text-primary)">
              Radio Group
            </h3>
            <RadioGroup defaultValue="option-one">
              <RadioGroupItem value="option-one" label="Option One" />
              <RadioGroupItem value="option-two" label="Option Two" />
              <RadioGroupItem value="option-three" label="Option Three" />
            </RadioGroup>
          </Card>
        </div>
      </section>

      {/* Badges & Alerts */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">
          Feedback
        </h2>
        <div className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
        </div>

        <h3 className="text-lg font-medium text-(--text-primary) pt-4">
          Badges with Icons
        </h3>
        <div className="flex flex-wrap gap-4">
          <Badge className="gap-1">
            <User size={12} />
            User
          </Badge>
          <Badge variant="success" className="gap-1">
            <Check size={12} />
            Completed
          </Badge>
          <Badge variant="warning" className="gap-1">
            <AlertTriangle size={12} />
            Warning
          </Badge>
          <Badge variant="destructive" className="gap-1">
            <X size={12} />
            Error
          </Badge>
        </div>

        <h3 className="text-lg font-medium text-(--text-primary) pt-4">
          Status Badges
        </h3>
        <div className="flex flex-wrap gap-4">
          <Badge variant="outline" className="gap-1.5 pl-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Online
          </Badge>
          <Badge variant="outline" className="gap-1.5 pl-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Away
          </Badge>
          <Badge variant="outline" className="gap-1.5 pl-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Busy
          </Badge>
          <Badge variant="outline" className="gap-1.5 pl-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Offline
          </Badge>
        </div>

        <h3 className="text-lg font-medium text-(--text-primary) pt-4">
          Split Badges
        </h3>
        <div className="flex flex-wrap gap-4">
          <Badge variant="split-primary">Primary</Badge>
          <Badge variant="split-secondary">Secondary</Badge>
          <Badge variant="split-destructive">Destructive</Badge>
          <Badge variant="split-success">Success</Badge>
          <Badge variant="split-warning">Warning</Badge>
        </div>

        <h3 className="text-lg font-medium text-(--text-primary) pt-4">
          Soft / Label Badges
        </h3>
        <div className="flex flex-wrap gap-4">
          <Badge variant="soft-primary">Primary</Badge>
          <Badge variant="soft-secondary">Secondary</Badge>
          <Badge variant="soft-destructive">Destructive</Badge>
          <Badge variant="soft-success">Success</Badge>
          <Badge variant="soft-warning">Warning</Badge>
          <Badge variant="soft-info">Info</Badge>
          <Badge variant="soft-dark">Dark</Badge>
        </div>

        <h3 className="text-lg font-medium text-(--text-primary) pt-4">
          Extended Solid Badges
        </h3>
        <div className="flex flex-wrap gap-4">
          <Badge variant="info">Info</Badge>
          <Badge variant="dark">Dark</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Alert title="Heads up!">
            You can add components to your app using the cli.
          </Alert>
          <Alert variant="destructive" title="Error">
            Your session has expired. Please log in again.
          </Alert>
          <Alert variant="success" title="Success">
            Your changes have been saved successfully.
          </Alert>
          <Alert variant="warning" title="Warning">
            Your account is about to expire.
          </Alert>
        </div>
      </section>

      {/* Wizards */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">Wizards</h2>

        {/* Simple Wizard */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-(--text-primary) mb-4">
            Simple Linear Wizard
          </h3>
          <Wizard
            currentStep={simpleWizardStep}
            onStepChange={setSimpleWizardStep}
          >
            <WizardList>
              <WizardStep stepIndex={0} title="Account Details" />
              <WizardStep stepIndex={1} title="Personal Info" />
              <WizardStep stepIndex={2} title="Confirmation" />
            </WizardList>
            <div className="mt-8 p-4 border border-dashed rounded-lg bg-(--bg-secondary)/50">
              <WizardContent stepIndex={0}>
                <div className="space-y-4">
                  <h4 className="font-medium">Account Details</h4>
                  <p className="text-sm text-(--text-muted)">
                    Enter your email and password to create an account.
                  </p>
                  <Input placeholder="Email Address" />
                </div>
              </WizardContent>
              <WizardContent stepIndex={1}>
                <div className="space-y-4">
                  <h4 className="font-medium">Personal Information</h4>
                  <p className="text-sm text-(--text-muted)">
                    Tell us a bit about yourself.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="First Name" />
                    <Input placeholder="Last Name" />
                  </div>
                </div>
              </WizardContent>
              <WizardContent stepIndex={2}>
                <div className="flex flex-col items-center justify-center space-y-4 py-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircle size={24} />
                  </div>
                  <h4 className="font-medium">All Set!</h4>
                  <p className="text-sm text-(--text-muted) text-center">
                    Your account has been successfully created.
                  </p>
                </div>
              </WizardContent>
            </div>
            <WizardFooter>
              <Button variant="ghost">Cancel</Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setSimpleWizardStep((prev) => Math.max(0, prev - 1))
                  }
                  disabled={simpleWizardStep === 0}
                >
                  Back
                </Button>
                <Button
                  onClick={() =>
                    setSimpleWizardStep((prev) => Math.min(2, prev + 1))
                  }
                  disabled={simpleWizardStep === 2}
                >
                  {simpleWizardStep === 2 ? "Finish" : "Next Step"}
                </Button>
              </div>
            </WizardFooter>
          </Wizard>
        </Card>

        {/* Connected Line Wizard */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-(--text-primary) mb-4">
            Connected Line Wizard
          </h3>
          <Wizard
            currentStep={connectedLineStep}
            onStepChange={setConnectedLineStep}
          >
            <WizardList variant="connectedLine">
              <WizardStep
                stepIndex={0}
                title="Personal Info"
                description="Your details"
                variant="connectedLine"
              />
              <WizardStep
                stepIndex={1}
                title="Contact"
                description="How to reach you"
                variant="connectedLine"
              />
              <WizardStep
                stepIndex={2}
                title="Review"
                description="Confirm details"
                variant="connectedLine"
              />
            </WizardList>
            <div className="mt-8 p-4 border border-dashed rounded-lg bg-(--bg-secondary)/50">
              <WizardContent stepIndex={0}>
                <div className="space-y-4">
                  <h4 className="font-medium">Personal Information</h4>
                  <p className="text-sm text-(--text-muted)">
                    Enter your personal details.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="First Name" />
                    <Input placeholder="Last Name" />
                  </div>
                </div>
              </WizardContent>
              <WizardContent stepIndex={1}>
                <div className="space-y-4">
                  <h4 className="font-medium">Contact Details</h4>
                  <p className="text-sm text-(--text-muted)">
                    How can we reach you?
                  </p>
                  <Input placeholder="Email Address" />
                  <Input placeholder="Phone Number" />
                </div>
              </WizardContent>
              <WizardContent stepIndex={2}>
                <div className="flex flex-col items-center justify-center space-y-4 py-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircle size={24} />
                  </div>
                  <h4 className="font-medium">Review Complete</h4>
                  <p className="text-sm text-(--text-muted) text-center">
                    Please review your information before submitting.
                  </p>
                </div>
              </WizardContent>
            </div>
            <WizardFooter>
              <Button variant="ghost">Cancel</Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setConnectedLineStep((prev) => Math.max(0, prev - 1))
                  }
                  disabled={connectedLineStep === 0}
                >
                  Back
                </Button>
                <Button
                  onClick={() =>
                    setConnectedLineStep((prev) => Math.min(2, prev + 1))
                  }
                  disabled={connectedLineStep === 2}
                >
                  {connectedLineStep === 2 ? "Submit" : "Next Step"}
                </Button>
              </div>
            </WizardFooter>
          </Wizard>
        </Card>

        {/* Chevron Wizard */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-(--text-primary) mb-4">
            Chevron Wizard
          </h3>
          <Wizard
            currentStep={chevronWizardStep}
            onStepChange={setChevronWizardStep}
          >
            <WizardList variant="chevron">
              <WizardStep
                stepIndex={0}
                title="Information"
                variant="chevron"
                isFirst
              />
              <WizardStep
                stepIndex={1}
                title="Verification"
                variant="chevron"
              />
              <WizardStep
                stepIndex={2}
                title="Complete"
                variant="chevron"
                isLast
              />
            </WizardList>
            <div className="mt-8 p-4 border border-dashed rounded-lg bg-(--bg-secondary)/50">
              <WizardContent stepIndex={0}>
                <div className="space-y-4">
                  <h4 className="font-medium">Information</h4>
                  <p className="text-sm text-(--text-muted)">
                    Enter your information to get started.
                  </p>
                  <Input placeholder="Full Name" />
                </div>
              </WizardContent>
              <WizardContent stepIndex={1}>
                <div className="space-y-4">
                  <h4 className="font-medium">Verification</h4>
                  <p className="text-sm text-(--text-muted)">
                    Verify your identity.
                  </p>
                  <Input placeholder="Verification Code" />
                </div>
              </WizardContent>
              <WizardContent stepIndex={2}>
                <div className="flex flex-col items-center justify-center space-y-4 py-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircle size={24} />
                  </div>
                  <h4 className="font-medium">Complete!</h4>
                  <p className="text-sm text-(--text-muted) text-center">
                    You have completed the process.
                  </p>
                </div>
              </WizardContent>
            </div>
            <WizardFooter>
              <Button variant="ghost">Cancel</Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setChevronWizardStep((prev) => Math.max(0, prev - 1))
                  }
                  disabled={chevronWizardStep === 0}
                >
                  Back
                </Button>
                <Button
                  onClick={() =>
                    setChevronWizardStep((prev) => Math.min(2, prev + 1))
                  }
                  disabled={chevronWizardStep === 2}
                >
                  {chevronWizardStep === 2 ? "Finish" : "Next Step"}
                </Button>
              </div>
            </WizardFooter>
          </Wizard>
        </Card>

        {/* Wizard with Icons */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-(--text-primary) mb-4">
            Icon-Based Horizontal Wizard
          </h3>
          <Wizard currentStep={iconWizardStep} onStepChange={setIconWizardStep}>
            <WizardList>
              <WizardStep stepIndex={0} title="Cart" icon={<Box size={16} />} />
              <WizardStep
                stepIndex={1}
                title="Shipping"
                icon={<CreditCard size={16} />}
              />
              <WizardStep
                stepIndex={2}
                title="Payment"
                icon={<Wallet size={16} />}
              />
              <WizardStep
                stepIndex={3}
                title="Complete"
                icon={<CheckCircle size={16} />}
              />
            </WizardList>
            <div className="mt-6 p-4 border rounded-lg bg-(--bg-card)">
              <WizardContent stepIndex={0}>
                <p className="text-sm text-(--text-muted)">
                  Review your cart items before proceeding.
                </p>
              </WizardContent>
              <WizardContent stepIndex={1}>
                <p className="text-sm text-(--text-muted)">
                  Enter your shipping details.
                </p>
              </WizardContent>
              <WizardContent stepIndex={2}>
                <p className="text-sm text-(--text-muted)">
                  Complete your payment securely.
                </p>
              </WizardContent>
              <WizardContent stepIndex={3}>
                <p className="text-sm text-(--text-muted)">
                  Your order has been placed!
                </p>
              </WizardContent>
            </div>
            <WizardFooter>
              <Button
                variant="secondary"
                onClick={() =>
                  setIconWizardStep((prev) => Math.max(0, prev - 1))
                }
                disabled={iconWizardStep === 0}
              >
                Back
              </Button>
              <Button
                onClick={() =>
                  setIconWizardStep((prev) => Math.min(3, prev + 1))
                }
                disabled={iconWizardStep === 3}
              >
                {iconWizardStep === 3 ? "Done" : "Next"}
              </Button>
            </WizardFooter>
          </Wizard>
        </Card>

        {/* Compact Wizard */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-(--text-primary) mb-4">
            Compact Horizontal Wizard
          </h3>
          <Wizard
            currentStep={compactWizardStep}
            onStepChange={setCompactWizardStep}
          >
            <WizardList className="justify-center">
              <WizardStep stepIndex={0} title="Step 1" />
              <WizardStep stepIndex={1} title="Step 2" />
              <WizardStep stepIndex={2} title="Step 3" />
              <WizardStep stepIndex={3} title="Step 4" />
              <WizardStep stepIndex={4} title="Step 5" />
            </WizardList>
            <div className="mt-6 text-center p-8 border border-dashed rounded-lg">
              <WizardContent stepIndex={0}>
                <h4 className="font-medium">Getting Started</h4>
              </WizardContent>
              <WizardContent stepIndex={1}>
                <h4 className="font-medium">Configuration</h4>
              </WizardContent>
              <WizardContent stepIndex={2}>
                <h4 className="font-medium">Customization</h4>
              </WizardContent>
              <WizardContent stepIndex={3}>
                <h4 className="font-medium">Preview</h4>
              </WizardContent>
              <WizardContent stepIndex={4}>
                <h4 className="font-medium">Complete!</h4>
              </WizardContent>
            </div>
            <WizardFooter className="justify-center gap-4">
              <Button
                variant="ghost"
                onClick={() =>
                  setCompactWizardStep((prev) => Math.max(0, prev - 1))
                }
                disabled={compactWizardStep === 0}
              >
                Previous
              </Button>
              <Button
                onClick={() =>
                  setCompactWizardStep((prev) => Math.min(4, prev + 1))
                }
                disabled={compactWizardStep === 4}
              >
                {compactWizardStep === 4 ? "Finish" : "Continue"}
              </Button>
            </WizardFooter>
          </Wizard>
        </Card>

        {/* Progress Bar Wizard */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-(--text-primary) mb-4">
            Progress Bar Wizard
          </h3>
          <Wizard
            currentStep={progressWizardStep}
            onStepChange={setProgressWizardStep}
          >
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-(--text-muted)">
                  Step {progressWizardStep + 1} of 4
                </span>
                <span className="font-medium text-(--primary)">
                  {Math.round((progressWizardStep / 3) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-(--secondary)/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-(--primary) transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${(progressWizardStep / 3) * 100}%` }}
                />
              </div>
            </div>
            <WizardList className="mb-4">
              <WizardStep
                stepIndex={0}
                title="Basics"
                description="Project name"
              />
              <WizardStep
                stepIndex={1}
                title="Details"
                description="Configuration"
              />
              <WizardStep
                stepIndex={2}
                title="Features"
                description="Select options"
              />
              <WizardStep stepIndex={3} title="Deploy" description="Go live" />
            </WizardList>
            <div className="p-6 border rounded-lg bg-(--bg-secondary)/30">
              <WizardContent stepIndex={0}>
                <div className="space-y-4">
                  <Input placeholder="Project Name" />
                  <Textarea placeholder="Project Description" />
                </div>
              </WizardContent>
              <WizardContent stepIndex={1}>
                <div className="space-y-4">
                  <Input placeholder="Repository URL" />
                  <Input placeholder="Branch Name" />
                </div>
              </WizardContent>
              <WizardContent stepIndex={2}>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="soft-primary">TypeScript</Badge>
                  <Badge variant="soft-success">ESLint</Badge>
                  <Badge variant="soft-warning">Prettier</Badge>
                  <Badge variant="soft-info">Testing</Badge>
                </div>
              </WizardContent>
              <WizardContent stepIndex={3}>
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h4 className="font-medium">Ready to Deploy!</h4>
                </div>
              </WizardContent>
            </div>
            <WizardFooter>
              <Button
                variant="secondary"
                onClick={() =>
                  setProgressWizardStep((prev) => Math.max(0, prev - 1))
                }
                disabled={progressWizardStep === 0}
              >
                Back
              </Button>
              <Button
                onClick={() =>
                  setProgressWizardStep((prev) => Math.min(3, prev + 1))
                }
                disabled={progressWizardStep === 3}
              >
                {progressWizardStep === 3 ? "Deploy" : "Next Step"}
              </Button>
            </WizardFooter>
          </Wizard>
        </Card>

        {/* Centered Indicator Wizard */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-(--text-primary) mb-4">
            Centered Indicator Wizard
          </h3>
          <Wizard
            currentStep={centeredIndicatorStep}
            onStepChange={setCenteredIndicatorStep}
          >
            <WizardList className="justify-center">
              <WizardStep
                stepIndex={0}
                title="Select"
                icon={<Box size={18} />}
                centered
              />
              <WizardStep
                stepIndex={1}
                title="Configure"
                icon={<Layers size={18} />}
                centered
              />
              <WizardStep
                stepIndex={2}
                title="Review"
                icon={<Search size={18} />}
                centered
              />
              <WizardStep
                stepIndex={3}
                title="Complete"
                icon={<CheckCircle size={18} />}
                centered
              />
            </WizardList>
            <div className="mt-8 p-6 text-center border rounded-xl bg-(--bg-card)">
              <WizardContent stepIndex={0}>
                <h4 className="font-semibold text-lg mb-2">
                  Select Your Options
                </h4>
                <p className="text-sm text-(--text-muted)">
                  Choose the settings that work best for you.
                </p>
              </WizardContent>
              <WizardContent stepIndex={1}>
                <h4 className="font-semibold text-lg mb-2">
                  Configure Settings
                </h4>
                <p className="text-sm text-(--text-muted)">
                  Customize your preferences.
                </p>
              </WizardContent>
              <WizardContent stepIndex={2}>
                <h4 className="font-semibold text-lg mb-2">Review Changes</h4>
                <p className="text-sm text-(--text-muted)">
                  Double-check everything before proceeding.
                </p>
              </WizardContent>
              <WizardContent stepIndex={3}>
                <div className="text-green-600">
                  <CheckCircle size={48} className="mx-auto mb-2" />
                  <h4 className="font-semibold text-lg">All Done!</h4>
                </div>
              </WizardContent>
            </div>
            <WizardFooter className="justify-center gap-4">
              <Button
                variant="secondary"
                onClick={() =>
                  setCenteredIndicatorStep((prev) => Math.max(0, prev - 1))
                }
                disabled={centeredIndicatorStep === 0}
              >
                Back
              </Button>
              <Button
                onClick={() =>
                  setCenteredIndicatorStep((prev) => Math.min(3, prev + 1))
                }
                disabled={centeredIndicatorStep === 3}
              >
                {centeredIndicatorStep === 3 ? "Finish" : "Next"}
              </Button>
            </WizardFooter>
          </Wizard>
        </Card>

        {/* Vertical Wizard */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-(--text-primary) mb-4">
            Vertical Wizard
          </h3>
          <Wizard
            orientation="vertical"
            currentStep={verticalWizardStep}
            onStepChange={setVerticalWizardStep}
          >
            <WizardList className="w-48">
              <WizardStep
                stepIndex={0}
                title="Shipping"
                description="Enter delivery address"
                icon={<Box size={16} />}
              />
              <WizardStep
                stepIndex={1}
                title="Payment"
                description="Select payment method"
                icon={<CreditCard size={16} />}
              />
              <WizardStep
                stepIndex={2}
                title="Review"
                description="Confirm your order"
                icon={<CheckCircle size={16} />}
              />
            </WizardList>
            <div className="flex-1 p-6 border rounded-lg bg-(--bg-card)">
              <WizardContent stepIndex={0}>
                <h4 className="font-medium mb-4">Shipping Information</h4>
                <div className="grid gap-4">
                  <Input placeholder="Street Address" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="City" />
                    <Input placeholder="Zip Code" />
                  </div>
                </div>
              </WizardContent>
              <WizardContent stepIndex={1}>
                <h4 className="font-medium mb-4">Payment Details</h4>
                <div className="space-y-4">
                  <RadioGroup defaultValue="card">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="card"
                        id="card"
                        label="Credit Card"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="paypal"
                        id="paypal"
                        label="PayPal"
                      />
                    </div>
                  </RadioGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Card Number" />
                    <Input placeholder="CVC" className="w-24" />
                  </div>
                </div>
              </WizardContent>
              <WizardContent stepIndex={2}>
                <div className="space-y-4">
                  <h4 className="font-medium">Order Summary</h4>
                  <div className="p-4 bg-(--bg-secondary)/50 rounded text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>$120.00</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>$120.00</span>
                    </div>
                  </div>
                </div>
              </WizardContent>
              <WizardFooter className="mt-8 pt-4">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setVerticalWizardStep((prev) => Math.max(0, prev - 1))
                  }
                  disabled={verticalWizardStep === 0}
                >
                  Back
                </Button>
                <Button
                  onClick={() =>
                    setVerticalWizardStep((prev) => Math.min(2, prev + 1))
                  }
                  disabled={verticalWizardStep === 2}
                >
                  {verticalWizardStep === 2 ? "Finish" : "Continue"}
                </Button>
              </WizardFooter>
            </div>
          </Wizard>
        </Card>
      </section>

      {/* Table */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">Table</h2>
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>
                  <Badge variant="success">Paid</Badge>
                </TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">INV002</TableCell>
                <TableCell>
                  <Badge variant="warning">Pending</Badge>
                </TableCell>
                <TableCell>PayPal</TableCell>
                <TableCell className="text-right">$150.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">INV003</TableCell>
                <TableCell>
                  <Badge variant="destructive">Unpaid</Badge>
                </TableCell>
                <TableCell>Bank Transfer</TableCell>
                <TableCell className="text-right">$350.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </section>
    </div>
  );
}
