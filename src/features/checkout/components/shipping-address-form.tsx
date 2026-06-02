'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { shippingAddressSchema, type ShippingAddressValues } from '@/features/checkout/schemas/checkout.schemas'
import type { Address } from '@/types/database'
import { cn } from '@/lib/utils'

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'IN', name: 'India' },
]

interface ShippingAddressFormProps {
  savedAddresses: Address[]
  defaultValues?: Partial<ShippingAddressValues>
  onSubmit: (values: ShippingAddressValues) => void
}

export function ShippingAddressForm({
  savedAddresses,
  defaultValues,
  onSubmit,
}: ShippingAddressFormProps) {
  const form = useForm<ShippingAddressValues>({
    resolver: zodResolver(shippingAddressSchema) as any,
    defaultValues: {
      fullName: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      saveAddress: false,
      ...defaultValues,
    },
  })

  function fillFromSaved(addr: Address) {
    form.reset({
      fullName:    addr.full_name,
      phone:       addr.phone ?? '',
      line1:       addr.line1,
      line2:       addr.line2 ?? '',
      city:        addr.city,
      state:       addr.state,
      postalCode:  addr.postal_code,
      country:     addr.country,
      saveAddress: false,
    })
  }

  return (
    <div className="space-y-4">
      {/* Saved address chips */}
      {savedAddresses.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Saved addresses</p>
          <div className="flex flex-wrap gap-2">
            {savedAddresses.map((addr) => (
              <button
                key={addr.id}
                type="button"
                onClick={() => fillFromSaved(addr)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-left text-xs transition-colors hover:bg-accent',
                  form.watch('line1') === addr.line1 &&
                    'border-primary bg-primary/5 font-medium',
                )}
              >
                <span className="font-medium">{addr.label}</span>
                <span className="ml-1 text-muted-foreground">
                  {addr.line1}, {addr.city}
                </span>
              </button>
            ))}
          </div>
          <Separator />
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" id="shipping-form">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Jane Smith" autoComplete="name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Phone (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="+1 555 000 0000" autoComplete="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="line1"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Address line 1</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="123 Main Street" autoComplete="address-line1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="line2"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Address line 2 (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Apt, suite, unit…" autoComplete="address-line2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="New York" autoComplete="address-level2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State / Province</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="NY" autoComplete="address-level1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal code</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="10001" autoComplete="postal-code" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      autoComplete="country"
                      className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="saveAddress"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    id="save-address"
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                </FormControl>
                <FormLabel htmlFor="save-address" className="cursor-pointer text-sm font-normal">
                  Save this address for future orders
                </FormLabel>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" size="lg">
            Continue to payment
          </Button>
        </form>
      </Form>
    </div>
  )
}
