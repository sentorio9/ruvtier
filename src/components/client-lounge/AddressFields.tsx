import { useState } from "react";

interface AddressData {
  street_address: string;
  street_address_2: string;
  city: string;
  state_province: string;
  zip_code: string;
  country: string;
}

interface Props {
  shippingAddress: AddressData;
  billingAddress: AddressData;
  useShippingAsBilling: boolean;
  onShippingChange: (field: keyof AddressData, value: string) => void;
  onBillingChange: (field: keyof AddressData, value: string) => void;
  onToggleBilling: (useSame: boolean) => void;
}

function InputField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block font-sans text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1.5">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 bg-transparent border border-border text-foreground text-[13px] font-sans focus:outline-none focus:border-foreground/40 transition-colors placeholder:text-muted-foreground/70"
      />
    </div>
  );
}

function AddressBlock({ title, data, onChange }: {
  title: string; data: AddressData; onChange: (field: keyof AddressData, value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-muted-foreground">{title}</p>
      <InputField label="Street Address" value={data.street_address} onChange={(v) => onChange("street_address", v)} />
      <InputField label="Apt / Suite / Unit" value={data.street_address_2} onChange={(v) => onChange("street_address_2", v)} />
      <div className="grid grid-cols-2 gap-3">
        <InputField label="City" value={data.city} onChange={(v) => onChange("city", v)} />
        <InputField label="State / Province" value={data.state_province} onChange={(v) => onChange("state_province", v)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Zip / Postal Code" value={data.zip_code} onChange={(v) => onChange("zip_code", v)} />
        <InputField label="Country" value={data.country} onChange={(v) => onChange("country", v)} />
      </div>
    </div>
  );
}

export default function AddressFields({ shippingAddress, billingAddress, useShippingAsBilling, onShippingChange, onBillingChange, onToggleBilling }: Props) {
  return (
    <div className="space-y-5">
      <AddressBlock title="Shipping Address" data={shippingAddress} onChange={onShippingChange} />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="same-billing"
          checked={useShippingAsBilling}
          onChange={(e) => onToggleBilling(e.target.checked)}
          className="w-3.5 h-3.5 accent-foreground"
        />
        <label htmlFor="same-billing" className="font-sans text-[11px] text-muted-foreground cursor-pointer">
          Billing address same as shipping
        </label>
      </div>

      {!useShippingAsBilling && (
        <AddressBlock title="Billing Address" data={billingAddress} onChange={onBillingChange} />
      )}
    </div>
  );
}

export type { AddressData };
