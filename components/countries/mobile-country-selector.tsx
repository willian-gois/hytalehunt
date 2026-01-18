"use client"

import { useRouter } from "next/navigation"

import { CircleFlag } from "react-circle-flags"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CountryOption {
  code: string
  name: string
  count: number
}

interface MobileCountrySelectorProps {
  countries: CountryOption[]
  selectedCountryCode: string
  sortParam?: string
}

export function MobileCountrySelector({
  countries,
  selectedCountryCode,
  sortParam = "",
}: MobileCountrySelectorProps) {
  const router = useRouter()

  // Find the selected country
  const selectedCountry = countries.find((c) => c.code === selectedCountryCode)

  return (
    <div className="mt-3 w-full md:hidden">
      <Select
        value={selectedCountryCode}
        onValueChange={(value) => {
          router.push(`/countries?country=${value}${sortParam ? `&sort=${sortParam}` : ""}`)
        }}
      >
        <SelectTrigger className="w-full text-sm">
          <SelectValue>
            {selectedCountry && (
              <div className="flex items-center gap-2">
                <CircleFlag countryCode={selectedCountry.code.toLowerCase()} height={20} />
                <span>{selectedCountry.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[60vh]">
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <div className="flex items-center gap-25">
                <CircleFlag
                  countryCode={country.code.toLowerCase()}
                  height={20}
                  className="w-5 h-5"
                />
                <span>
                  {country.name} ({country.count})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
