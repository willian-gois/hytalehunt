"use client"

import { useCallback, useEffect, useId, useState } from "react"
import { useRouter } from "next/navigation"

import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCalendarLine,
  RiCheckboxCircleFill,
  RiCheckboxCircleLine,
  RiCheckLine,
  RiCloseCircleLine,
  RiFileCheckLine,
  RiImageAddLine,
  RiInformation2Line,
  RiInformationLine,
  RiListCheck,
  RiLoader4Line,
  RiRocketLine,
  RiStarLine,
} from "@remixicon/react"
import { addDays, format, parseISO } from "date-fns"
import { type Tag, TagInput } from "emblor"

import {
  DATE_FORMAT,
  DOMAIN_AUTHORITY,
  LAUNCH_LIMITS,
  LAUNCH_SETTINGS,
  LAUNCH_TYPES,
  PREMIUM_MONTHLY_BUNDLE_PAYMENT_LINK,
  PREMIUM_PAYMENT_LINK,
  PREMIUM_WEEKLY_BUNDLE_PAYMENT_LINK,
  SPONSORSHIP_SLOTS,
} from "@/lib/constants"
import { UploadButton } from "@/lib/uploadthing"
import { useAnalytics } from "@/hooks/use-analytics"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { type Country, CountryDropdown } from "@/components/ui/country-dropdown"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextDisplay, RichTextEditor } from "@/components/ui/rich-text-editor"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { notifyDiscordLaunch } from "@/app/actions/discord"
import type { LaunchAvailability } from "@/app/actions/launch"
import {
  checkUserLaunchLimit,
  getLaunchAvailabilityRange,
  scheduleLaunch,
} from "@/app/actions/launch"
import { getAllCategories, submitServer } from "@/app/actions/servers"

import { ServerBannerWithLoader } from "./server-banner-with-loader"
import { ServerLogoWithFallback } from "./server-logo-with-fallback"
import { env } from "@/env"

const MAXIMUM_CATEGORY_COUNT = 5

const SERVER_VERSIONS = [{ value: "1.0", label: "1.0" }] as const

type SponsorshipMode = "none" | "weekly" | "monthly"

interface ServerFormData {
  name: string
  ipAddress: string
  websiteUrl?: string
  description: string
  categories: string[]
  mods: string[]
  discordUrl?: string
  twitterUrl?: string
  scheduledDate: string | null
  launchType: (typeof LAUNCH_TYPES)[keyof typeof LAUNCH_TYPES]
  bannerUrl: string | null
  version: string
  country: string
}

interface DateGroup {
  key: string
  displayName: string
  dates: LaunchAvailability[]
}

interface SubmitServerFormProps {
  userId: string
  userEmail: string
}

export function SubmitServerForm({ userId, userEmail }: SubmitServerFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ServerFormData>({
    name: "",
    ipAddress: "",
    websiteUrl: "",
    description: "",
    categories: [],
    mods: [],
    discordUrl: "",
    twitterUrl: "",
    scheduledDate: null,
    launchType: LAUNCH_TYPES.PREMIUM,
    bannerUrl: null,
    version: "1.0",
    country: "",
  })

  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null)

  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingBannerUrl, setisUploadingBannerUrl] = useState(false)

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [availableDates, setAvailableDates] = useState<LaunchAvailability[]>([])
  const [isLoadingDates, setIsLoadingDates] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const [isLaunchDateOverLimit, setIsLaunchDateOverLimit] = useState(false)
  const [launchDateLimitError, setLaunchDateLimitError] = useState<string | null>(null)
  const [isLoadingDateCheck, setIsLoadingDateCheck] = useState(false)

  const tagInputId = useId()

  const [modsTags, setModsTags] = useState<Tag[]>([])
  const [activeModTagIndex, setActiveModTagIndex] = useState<number | null>(null)

  const [selectedSponsorship, setSelectedSponsorship] = useState<SponsorshipMode>("none")

  const { track } = useAnalytics()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const checkIpAddress = async (ipAddress: string) => {
    try {
      const response = await fetch(
        `/api/servers/check-ip-address?ipAddress=${encodeURIComponent(ipAddress)}`,
      )
      const data = await response.json()
      return data.exists
    } catch (error) {
      console.error("Error checking IP address:", error)
      return false
    }
  }

  const loadAvailableDates = useCallback(async () => {
    setIsLoadingDates(true)
    try {
      let startDate, endDate
      const today = new Date()

      if (formData.launchType === LAUNCH_TYPES.PREMIUM) {
        startDate = format(addDays(today, LAUNCH_SETTINGS.PREMIUM_MIN_DAYS_AHEAD), DATE_FORMAT.API)
        endDate = format(addDays(today, LAUNCH_SETTINGS.PREMIUM_MAX_DAYS_AHEAD), DATE_FORMAT.API)
      } else {
        startDate = format(addDays(today, LAUNCH_SETTINGS.MIN_DAYS_AHEAD), DATE_FORMAT.API)
        endDate = format(addDays(today, LAUNCH_SETTINGS.MAX_DAYS_AHEAD), DATE_FORMAT.API)
      }

      const availability = await getLaunchAvailabilityRange(startDate, endDate, formData.launchType)
      setAvailableDates(availability)
    } catch (err) {
      console.error("Error loading dates:", err)
      setError("Failed to load available dates")
    } finally {
      setIsLoadingDates(false)
    }
  }, [formData.launchType])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (currentStep === 3) {
      loadAvailableDates()
    }
  }, [currentStep, loadAvailableDates])

  useEffect(() => {
    const tagsFromFormData = formData.mods.map((mods, index) => ({
      id: `${index}-${mods}`,
      text: mods,
    }))
    if (JSON.stringify(tagsFromFormData) !== JSON.stringify(modsTags)) {
      setModsTags(tagsFromFormData)
    }
  }, [formData.mods])

  useEffect(() => {
    const modsStringArray = modsTags.map((tag) => tag.text)
    if (JSON.stringify(modsStringArray) !== JSON.stringify(formData.mods)) {
      setFormData((prev) => ({ ...prev, mods: modsStringArray }))
    }
  }, [modsTags])

  async function fetchCategories() {
    setIsLoadingCategories(true)
    try {
      const data = await getAllCategories()
      setCategories(data)
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError("Failed to load categories")
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleLaunchTypeChange = (type: (typeof LAUNCH_TYPES)[keyof typeof LAUNCH_TYPES]) => {
    setFormData((prev) => ({
      ...prev,
      launchType: type,
      scheduledDate: null,
    }))
  }

  function groupDatesByMonth(dates: LaunchAvailability[]): DateGroup[] {
    const uniqueDates = Array.from(new Map(dates.map((date) => [date.date, date])).values())

    const groups = new Map<string, DateGroup>()

    const sortedDates = [...uniqueDates].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    sortedDates.forEach((date) => {
      const dateObj = new Date(date.date)
      const year = dateObj.getFullYear()
      const month = dateObj.getMonth()
      const groupKey = `${year}-${month}`
      const displayMonth = format(dateObj, DATE_FORMAT.DISPLAY_MONTH)

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          key: groupKey,
          displayName: displayMonth,
          dates: [],
        })
      }
      groups.get(groupKey)?.dates.push(date)
    })

    return Array.from(groups.values()).sort((a, b) => {
      const aDate = new Date(a.dates[0].date)
      const bDate = new Date(b.dates[0].date)
      return aDate.getTime() - bDate.getTime()
    })
  }

  const validateLaunchDateLimit = useCallback(
    async (date: string | null) => {
      if (!date || !userId) {
        setIsLaunchDateOverLimit(false)
        setLaunchDateLimitError(null)
        setIsLoadingDateCheck(false)
        return
      }
      setIsLoadingDateCheck(true)
      setLaunchDateLimitError(null)
      try {
        const result = await checkUserLaunchLimit(userId, date)
        if (!result.allowed) {
          setIsLaunchDateOverLimit(true)
          setLaunchDateLimitError(
            `You have already scheduled ${result.count}/${result.limit} server(s) for this date. Please select another date.`,
          )
        } else {
          setIsLaunchDateOverLimit(false)
        }
      } catch (err) {
        console.error("Error checking launch date limit:", err)
        setIsLaunchDateOverLimit(false)
        setLaunchDateLimitError("Could not verify launch date limit. Please try again.")
      } finally {
        setIsLoadingDateCheck(false)
      }
    },
    [userId],
  )

  useEffect(() => {
    if (formData.scheduledDate && currentStep === 3) {
      validateLaunchDateLimit(formData.scheduledDate)
    }
  }, [formData.scheduledDate, currentStep, validateLaunchDateLimit])

  const nextStep = () => {
    setError(null)
    setLaunchDateLimitError(null)
    if (currentStep === 1) {
      if (
        !formData.name ||
        !formData.ipAddress ||
        !formData.description ||
        !uploadedLogoUrl ||
        !formData.bannerUrl ||
        !formData.country ||
        !formData.version
      ) {
        setError("Please fill in all required server information.")
        return
      }
      if (formData.websiteUrl) {
        try {
          new URL(formData.websiteUrl)
        } catch {
          setError("Please enter a valid website URL.")
          return
        }
      }
    }

    if (currentStep === 2) {
      if (formData.categories.length === 0) {
        setError("Please complete the technical details and categorization.")
        return
      }

      if (formData.categories.length > MAXIMUM_CATEGORY_COUNT) {
        setError(`You can select a maximum of ${MAXIMUM_CATEGORY_COUNT} categories.`)
        return
      }

      if (formData.mods.length > 5) {
        setError("You can add a maximum of 5 mods.")
        return
      }
    }

    if (currentStep === 3) {
      if (!formData.scheduledDate) {
        setError("Please select a launch date.")
        return
      }
      if (isLaunchDateOverLimit) {
        setError(launchDateLimitError || "This launch date is not available due to daily limit.")
        return
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 4))

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 0)
  }

  const prevStep = () => {
    setError(null)
    setLaunchDateLimitError(null)
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 0)
  }

  const handleFinalSubmit = async () => {
    // Validações iniciais
    if (
      !formData.name ||
      !formData.description ||
      !uploadedLogoUrl ||
      !formData.bannerUrl ||
      !formData.country ||
      !formData.version ||
      formData.categories.length === 0
    ) {
      setError("Some required information is missing. Please go back and complete all fields.")
      setIsPending(false)
      return
    }

    if (formData.categories.length > MAXIMUM_CATEGORY_COUNT) {
      setError(`You can select a maximum of ${MAXIMUM_CATEGORY_COUNT} categories.`)
      return
    }

    if (formData.mods.length > 5) {
      setError("You can add a maximum of 5 mods.")
      return
    }

    const ipExists = await checkIpAddress(formData.ipAddress)
    if (ipExists) {
      setError(
        `This IP address has already been submitted. Contact ${env.NEXT_PUBLIC_CONTACT_EMAIL} if you think this is a mistake.`,
      )
      setIsPending(false)
      return
    }

    if (isLaunchDateOverLimit && formData.scheduledDate) {
      setError(
        launchDateLimitError || "Cannot submit: The selected launch date exceeds your daily limit.",
      )
      setIsPending(false)
      return
    }

    setIsPending(true)
    setError(null)
    setLaunchDateLimitError(null)

    try {
      const finalLogoUrl = !uploadedLogoUrl
        ? "https://placehold.co/128x128/E2E8F0/718096?text=Logo"
        : uploadedLogoUrl

      const serverData = {
        name: formData.name,
        description: formData.description,
        ipAddress: formData.ipAddress,
        websiteUrl: formData.websiteUrl,
        logoUrl: finalLogoUrl,
        bannerUrl: formData.bannerUrl,
        categories: formData.categories,
        mods: formData.mods,
        discordUrl: formData.discordUrl || null,
        twitterUrl: formData.twitterUrl || null,
        version: formData.version,
        country: formData.country,
      }

      const submissionResult = await submitServer(serverData)

      if (!submissionResult.success || !submissionResult.serverId || !submissionResult.slug) {
        throw new Error(submissionResult.error || "Failed to submit server data.")
      }

      const serverId = submissionResult.serverId
      const serverSlug = submissionResult.slug

      if (formData.scheduledDate) {
        try {
          const formattedDate = format(parseISO(formData.scheduledDate), DATE_FORMAT.API)
          const launchSuccess = await scheduleLaunch(
            serverId,
            formattedDate,
            formData.launchType,
            userId,
          )

          if (!launchSuccess) {
            console.error(`Server ${serverId} created but failed to schedule for ${formattedDate}`)
            throw new Error("Server created, but failed to schedule the launch.")
          }

          try {
            await notifyDiscordLaunch(
              formData.name,
              format(parseISO(formData.scheduledDate), DATE_FORMAT.DISPLAY),
              formData.launchType,
              `${env.NEXT_PUBLIC_URL}/servers/${serverSlug}`,
              formData.websiteUrl,
            )
          } catch (discordError) {
            console.error("Failed to send Discord notification:", discordError)
          }
        } catch (scheduleError: unknown) {
          console.error("Error during launch scheduling:", scheduleError)
          setError(
            scheduleError instanceof Error
              ? scheduleError.message
              : "An error occurred during scheduling.",
          )
          setIsPending(false)
          return
        }
      }

      if (formData.launchType === LAUNCH_TYPES.FREE) {
        router.push(`/servers/${serverSlug}`)
      } else {
        track("begin_checkout", {
          server_id: serverId,
          sponsorship_upsell: selectedSponsorship,
        })

        const paymentLink: Record<SponsorshipMode, string> = {
          none: PREMIUM_PAYMENT_LINK,
          weekly: PREMIUM_WEEKLY_BUNDLE_PAYMENT_LINK,
          monthly: PREMIUM_MONTHLY_BUNDLE_PAYMENT_LINK,
        }

        const paymentUrl = `${paymentLink[selectedSponsorship]}?client_reference_id=${serverId}&prefilled_email=${userEmail}`

        window.location.href = paymentUrl
      }
    } catch (submissionError: unknown) {
      console.error("Error during final submission:", submissionError)
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "An unexpected error occurred.",
      )
      setIsPending(false)
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    handleFinalSubmit()
  }

  const renderStepper = () => (
    <div className="mb-8 sm:mb-10">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center justify-between pt-2 sm:px-4 sm:pt-0">
          {[
            { step: 1, label: "Server Info", icon: RiListCheck },
            {
              step: 2,
              label: "Details",
              shortLabel: "Details",
              icon: RiInformation2Line,
            },
            { step: 3, label: "Launch Date", icon: RiCalendarLine },
            { step: 4, label: "Review", icon: RiFileCheckLine },
          ].map(({ step, label, shortLabel, icon: Icon }) => (
            <div
              key={`step-${step}`}
              className="relative flex w-[120px] flex-col items-center sm:w-[140px]"
            >
              {step < 3 && (
                <div className="absolute top-5 left-[calc(50%+1.5rem)] -z-10 hidden h-[2px] w-[calc(100%-1rem)] sm:block">
                  <div
                    className={`h-full ${
                      currentStep > step ? "bg-primary" : "bg-muted"
                    } transition-all duration-300`}
                  />
                </div>
              )}

              <div
                className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 sm:h-12 sm:w-12 ${
                  currentStep > step
                    ? "bg-primary ring-primary/10 text-white ring-4"
                    : currentStep === step
                      ? "bg-primary ring-primary/20 text-white ring-4"
                      : "bg-muted/50 text-muted-foreground"
                }`}
              >
                {currentStep > step ? (
                  <RiCheckLine className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                )}

                {currentStep === step && (
                  <span className="border-primary absolute inset-0 animate-pulse rounded-full border-2" />
                )}
              </div>

              <div className="mt-3 w-full text-center sm:mt-4">
                <span
                  className={`mb-0.5 block text-xs font-medium sm:text-sm ${
                    currentStep >= step ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <span className="hidden sm:inline">{label}</span>
                  <span className="inline sm:hidden">{shortLabel || label}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 px-2 sm:mt-6 sm:px-4">
        <div className="bg-muted/50 h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )

  const handleCheckboxChange = (field: "categories", value: string, checked: boolean) => {
    setFormData((prev) => {
      const currentValues = prev[field] || []
      if (checked) {
        return { ...prev, [field]: [...currentValues, value] }
      } else {
        return {
          ...prev,
          [field]: currentValues.filter((item) => item !== value),
        }
      }
    })
  }

  const getCategoryName = (id: string) => categories.find((cat) => cat.id === id)?.name || id

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">
                Server Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="My Awesome Server"
                required
              />
            </div>
            <div>
              <Label htmlFor="ipAddress">
                IP Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ipAddress"
                name="ipAddress"
                value={formData.ipAddress}
                onChange={handleInputChange}
                placeholder="play.myawesomeserver.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="websiteUrl">Website URL (Optional, but recommended)</Label>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={handleInputChange}
                placeholder="https://myawesomeserver.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <RichTextEditor
                content={formData.description}
                onChange={(content) => setFormData((prev) => ({ ...prev, description: content }))}
                placeholder="Describe your server"
                className="max-h-[300px] overflow-y-auto"
              />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="version">
                  Server Version <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.version}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, version: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a version" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVER_VERSIONS.map((version) => (
                      <SelectItem key={version.value} value={version.value}>
                        {version.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="country">
                  Server Country <span className="text-red-500">*</span>
                </Label>
                <div className="mt-1">
                  <CountryDropdown
                    defaultValue={formData.country || undefined}
                    onChange={(country: Country) =>
                      setFormData((prev) => ({
                        ...prev,
                        country: country.alpha2,
                      }))
                    }
                    placeholder="Select a country"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">
                Logo <span className="text-red-500">*</span>
              </Label>
              <p className="text-muted-foreground text-xs">
                Recommended: 1:1 square image (e.g., 64x64px). Max 1MB.
              </p>
              {uploadedLogoUrl ? (
                <div className="bg-muted/30 relative w-fit rounded-md border p-3">
                  <ServerLogoWithFallback
                    logoUrl={uploadedLogoUrl}
                    name={"Logo Preview"}
                    className="rounded object-contain"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground absolute top-1 right-1 h-6 w-6"
                    onClick={() => setUploadedLogoUrl(null)}
                    aria-label="Remove logo"
                  >
                    <RiCloseCircleLine className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2">
                  <UploadButton
                    endpoint="serverLogo"
                    onUploadBegin={() => {
                      console.log("Upload Begin (Logo)")
                      setIsUploadingLogo(true)
                      setError(null)
                    }}
                    onClientUploadComplete={(res) => {
                      console.log("Upload Response (Logo):", res)
                      setIsUploadingLogo(false)
                      if (res && res.length > 0 && res[0].serverData?.fileUrl) {
                        setUploadedLogoUrl(res[0].serverData.fileUrl)
                        console.log("Logo URL set:", res[0].serverData.fileUrl)
                      } else {
                        console.error("Logo upload failed: No URL", res)
                        setError("Logo upload failed: No URL returned.")
                      }
                    }}
                    onUploadError={(error: Error) => {
                      console.error("Upload Error (Logo):", error)
                      setIsUploadingLogo(false)
                      setError(`Logo upload failed. Check file type and size.`)
                    }}
                    appearance={{
                      button: `ut-button border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm h-9 px-3 inline-flex items-center justify-center gap-2 ${isUploadingLogo ? "opacity-50 pointer-events-none" : ""}`,
                      allowedContent: "hidden",
                    }}
                    content={{
                      button({ ready, isUploading }) {
                        if (isUploading) return <RiLoader4Line className="h-4 w-4 animate-spin" />
                        if (ready)
                          return (
                            <>
                              <RiImageAddLine className="h-4 w-4" /> Upload Logo
                            </>
                          )
                        return "Getting ready..."
                      },
                    }}
                  />
                  {isUploadingLogo && (
                    <span className="text-muted-foreground text-xs">Uploading...</span>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bannerUrl">
                Server Banner <span className="text-red-500">*</span>
              </Label>
              <p className="text-muted-foreground text-xs">
                Add a server banner (image, GIF, WebP or video). Images: max 2MB. Videos: max 4MB.
              </p>
              {formData.bannerUrl ? (
                <div className="bg-muted/30 relative w-fit rounded-md border p-3">
                  <ServerBannerWithLoader src={formData.bannerUrl} alt="Banner preview" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground absolute top-1 right-1 h-6 w-6"
                    onClick={() => setFormData((prev) => ({ ...prev, bannerUrl: null }))}
                    aria-label="Remove banner"
                  >
                    <RiCloseCircleLine className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2">
                  <UploadButton
                    endpoint="serverBanner"
                    onUploadBegin={() => {
                      console.log("Upload Begin (Banner)")
                      setisUploadingBannerUrl(true)
                      setError(null)
                    }}
                    onClientUploadComplete={(res) => {
                      console.log("Upload Response (Banner):", res)
                      setisUploadingBannerUrl(false)
                      if (res && res.length > 0 && res[0].serverData?.fileUrl) {
                        const fileType = res[0].type
                        setFormData((prev) => ({
                          ...prev,
                          bannerUrl: res[0].serverData.fileUrl,
                        }))
                        console.log("Banner URL set:", res[0].serverData.fileUrl)
                        console.log("Banner type:", fileType)
                      } else {
                        console.error("Banner upload failed: No URL", res)
                        setError("Banner upload failed: No URL returned.")
                      }
                    }}
                    onUploadError={(error: Error) => {
                      console.error("Upload Error (Banner):", error)
                      setisUploadingBannerUrl(false)
                      setError(`Banner upload failed. Check type and size.`)
                    }}
                    appearance={{
                      button: `ut-button flex items-center w-fit gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm h-9 px-3 ${isUploadingBannerUrl ? "opacity-50 pointer-events-none" : ""}`,
                      allowedContent: "hidden",
                    }}
                    content={{
                      button({ ready, isUploading }) {
                        if (isUploading) return <RiLoader4Line className="h-4 w-4 animate-spin" />
                        if (ready)
                          return (
                            <>
                              <RiImageAddLine className="h-4 w-4" /> Add Banner
                            </>
                          )
                        return "Getting ready..."
                      },
                    }}
                  />
                  {isUploadingBannerUrl && (
                    <span className="text-muted-foreground text-xs">Uploading...</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-8">
            <div>
              <Label className="mb-2 block">
                Categories <span className="text-red-500">*</span>
                <span className="text-muted-foreground ml-2 text-xs">
                  ({formData.categories.length} of maximum {MAXIMUM_CATEGORY_COUNT} selected)
                </span>
              </Label>
              {isLoadingCategories ? (
                <div className="text-muted-foreground flex items-center gap-2">
                  <RiLoader4Line className="h-4 w-4 animate-spin" /> Loading...
                </div>
              ) : categories.length > 0 ? (
                <div className="max-h-60 space-y-3 overflow-y-auto rounded-md border p-4">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${cat.id}`}
                        checked={formData.categories.includes(cat.id)}
                        onCheckedChange={(checked) => {
                          if (checked && formData.categories.length >= MAXIMUM_CATEGORY_COUNT) {
                            setError(
                              `You can select a maximum of ${MAXIMUM_CATEGORY_COUNT} categories.`,
                            )
                            return
                          }
                          handleCheckboxChange("categories", cat.id, !!checked)
                        }}
                      />
                      <Label htmlFor={`cat-${cat.id}`} className="cursor-pointer font-normal">
                        {cat.name}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No categories available.</p>
              )}
              <p className="text-muted-foreground mt-1 text-xs">
                Select up to 5 relevant categories.
              </p>
            </div>

            <div>
              <Label htmlFor={tagInputId}>
                Mods (Optional)
                <span className="text-muted-foreground ml-2 text-xs">
                  ({formData.mods.length}/5 mods)
                </span>
              </Label>
              <TagInput
                id={tagInputId}
                tags={modsTags}
                setTags={(newTags) => {
                  if (newTags.length > 5) {
                    setError("You can add a maximum of 5 mods.")
                    return
                  }
                  setModsTags(newTags)
                }}
                placeholder="Type a mod and press Enter..."
                styleClasses={{
                  inlineTagsContainer:
                    "border-input rounded-md bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring outline-none focus-within:ring-[3px] focus-within:ring-ring/50 p-1 gap-1 mt-1",
                  input: "w-full min-w-[80px] shadow-none px-2 h-7",
                  tag: {
                    body: "h-7 relative bg-background border border-input hover:bg-background rounded-md font-medium text-xs ps-2 pe-7",
                    closeButton:
                      "absolute -inset-y-px -end-px p-0 rounded-e-md flex size-7 transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] text-muted-foreground/80 hover:text-foreground",
                  },
                }}
                activeTagIndex={activeModTagIndex}
                setActiveTagIndex={setActiveModTagIndex}
              />
              <p className="text-muted-foreground mt-1 text-xs">
                Enter up to 5 mods used, press Enter or comma to add a tag.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="discordUrl">Discord URL (Optional)</Label>
                <Input
                  id="discordUrl"
                  name="discordUrl"
                  type="url"
                  value={formData.discordUrl}
                  onChange={handleInputChange}
                  placeholder="https://discord.gg/invite"
                />
              </div>
              <div>
                <Label htmlFor="twitterUrl">Twitter URL (Optional)</Label>
                <Input
                  id="twitterUrl"
                  name="twitterUrl"
                  type="url"
                  value={formData.twitterUrl}
                  onChange={handleInputChange}
                  placeholder="https://twitter.com/username"
                />
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <RiCalendarLine className="h-5 w-5" />
              <h3 className="text-lg font-medium">Choose Launch Type & Date</h3>
            </div>

            <div className="bg-muted/30 border-muted flex items-start gap-2 rounded-lg border p-3 sm:p-4">
              <RiInformationLine className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div className="text-xs sm:text-sm">
                <p className="font-medium">Select your launch type and date</p>
                <p className="text-muted-foreground mt-1">
                  All launches happen at {LAUNCH_SETTINGS.LAUNCH_HOUR_UTC}:00 UTC. We launch a
                  limited number of servers each day.
                </p>
              </div>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-medium">Launch Type</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div
                  className={`cursor-pointer rounded-lg border p-4 transition-all duration-150 ${formData.launchType === LAUNCH_TYPES.FREE ? "border-primary ring-primary bg-primary/5 relative shadow-sm ring-1" : "hover:border-foreground/20 hover:bg-muted/50"}`}
                  onClick={() => handleLaunchTypeChange(LAUNCH_TYPES.FREE)}
                >
                  {formData.launchType === LAUNCH_TYPES.FREE && (
                    <Badge
                      variant="default"
                      className="bg-primary text-primary-foreground absolute -top-2 -right-2 text-xs"
                    >
                      Selected
                    </Badge>
                  )}
                  <h5 className="mb-2 flex items-center gap-1.5 font-medium">
                    <RiRocketLine className="h-4 w-4" />
                    Free Launch
                  </h5>
                  <p className="mb-3 text-2xl font-bold">$0</p>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    <li className="flex items-center gap-1.5">
                      <RiCheckboxCircleFill className="text-foreground/60 h-3.5 w-3.5 flex-shrink-0" />
                      <span>{LAUNCH_LIMITS.FREE_DAILY_LIMIT} slots/day</span>
                    </li>

                    <li className="flex items-center gap-1.5">
                      <RiCheckboxCircleFill className="text-foreground/60 h-3.5 w-3.5 flex-shrink-0" />
                      <span>Up to {LAUNCH_SETTINGS.MAX_DAYS_AHEAD} days scheduling</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <RiCheckboxCircleFill className="text-foreground/60 h-3.5 w-3.5 flex-shrink-0" />
                      <span>Dofollow Backlink only if:</span>
                    </li>
                    <li className="flex items-start gap-1.5 pl-5">
                      <span className="text-muted-foreground text-xs">1. Top 3 daily ranking</span>
                    </li>
                    <li className="flex items-start gap-1.5 pl-5">
                      <span className="text-muted-foreground text-xs">
                        2. Display our badge on your site
                      </span>
                    </li>
                  </ul>
                </div>

                <div
                  className={`cursor-pointer rounded-lg border p-4 transition-all duration-150 ${formData.launchType === LAUNCH_TYPES.PREMIUM ? "border-primary/70 ring-primary/70 bg-primary/5 relative shadow-sm ring-1" : "hover:border-primary/50 hover:bg-primary/5"}`}
                  onClick={() => handleLaunchTypeChange(LAUNCH_TYPES.PREMIUM)}
                >
                  {formData.launchType === LAUNCH_TYPES.PREMIUM && (
                    <Badge
                      variant="default"
                      className="bg-primary text-primary-foreground absolute -top-2 -right-2 text-xs"
                    >
                      Selected
                    </Badge>
                  )}
                  <h5 className="mb-2 flex items-center gap-1.5 font-medium">
                    <RiStarLine className="text-primary h-4 w-4" />
                    Premium Launch
                  </h5>
                  <p className="mb-3 text-2xl font-bold">${LAUNCH_SETTINGS.PREMIUM_PRICE}</p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-1.5">
                      <RiCheckboxCircleFill className="text-primary/80 h-3.5 w-3.5 flex-shrink-0" />
                      <span className="font-semibold">Skip the Free Queue</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <RiCheckboxCircleFill className="text-primary/80 h-3.5 w-3.5 flex-shrink-0" />
                      <span className="font-semibold">
                        Guaranteed Dofollow Backlink (DR {DOMAIN_AUTHORITY})
                      </span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <RiCheckboxCircleFill className="text-primary/80 h-3.5 w-3.5 flex-shrink-0" />
                      <span>{LAUNCH_LIMITS.PREMIUM_DAILY_LIMIT} premium slots/day</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <RiCheckboxCircleFill className="text-primary/80 h-3.5 w-3.5 flex-shrink-0" />
                      <span>Up to {LAUNCH_SETTINGS.PREMIUM_MAX_DAYS_AHEAD} days scheduling</span>
                    </li>
                  </ul>
                </div>

                {/* <div
                  className={`cursor-pointer rounded-lg border p-4 transition-all duration-150 ${
                    formData.launchType === LAUNCH_TYPES.PREMIUM_PLUS
                      ? "border-primary ring-primary bg-primary/5 relative shadow-sm ring-1"
                      : "hover:border-primary hover:bg-primary/5"
                  }`}
                  onClick={() => handleLaunchTypeChange(LAUNCH_TYPES.PREMIUM_PLUS)}
                >
                  {formData.launchType === LAUNCH_TYPES.PREMIUM_PLUS && (
                    <Badge
                      variant="default"
                      className="bg-primary text-primary-foreground absolute -top-2 -right-2 text-xs"
                    >
                      Selected
                    </Badge>
                  )}
                  <h5 className="mb-2 flex items-center gap-1.5 font-medium">
                    <RiVipCrownLine className="text-primary h-4 w-4" />
                    Premium Plus
                  </h5>
                  <p className="mb-1 text-2xl font-bold">
                    ${LAUNCH_SETTINGS.PREMIUM_PLUS_PRICE}{" "}
                    <span className="text-muted-foreground text-xs line-through">$25</span>
                  </p>
                  <span className="bg-primary/10 text-primary mb-2 inline-block rounded-full px-2 py-0.5 text-xs">
                    -50% for early users
                  </span>
                  <ul className="text-muted-foreground space-y-1.5 text-xs">
                    <li className="flex items-center gap-1.5">
                      <RiCheckboxCircleFill className="text-primary h-3.5 w-3.5 flex-shrink-0" />
                      <span>Premium Spotlight Placement</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <RiCheckboxCircleFill className="text-primary h-3.5 w-3.5 flex-shrink-0" />
                      <span>{LAUNCH_LIMITS.PREMIUM_PLUS_DAILY_LIMIT} exclusive slots/day</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <RiCheckboxCircleFill className="text-primary h-3.5 w-3.5 flex-shrink-0" />
                      <span>Guaranteed Dofollow Backlink</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <RiCheckboxCircleFill className="text-primary h-3.5 w-3.5 flex-shrink-0" />
                      <span>
                        Up to {LAUNCH_SETTINGS.PREMIUM_PLUS_MAX_DAYS_AHEAD} days scheduling
                      </span>
                    </li>
                  </ul>
                </div> */}
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-medium">
                Launch Date <span className="text-red-500">*</span>
              </h4>
              {isLoadingDates ? (
                <div className="text-muted-foreground flex items-center justify-center gap-2 py-4">
                  <RiLoader4Line className="h-5 w-5 animate-spin" /> Loading available dates...
                </div>
              ) : availableDates.length === 0 && !isLoadingDates ? (
                <p className="text-muted-foreground rounded-md border p-4 text-center text-sm">
                  No available launch dates found for the selected type in the allowed range.
                </p>
              ) : (
                <div>
                  <Select
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, scheduledDate: value }))
                    }
                    value={formData.scheduledDate || ""}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a launch date" />
                    </SelectTrigger>
                    <SelectContent>
                      {groupDatesByMonth(availableDates).map((group) => (
                        <SelectGroup key={group.key}>
                          <SelectLabel>{group.displayName}</SelectLabel>
                          {group.dates.map((date) => {
                            const dateObj = parseISO(date.date)
                            let slotsAvailable = 0
                            let isDisabled = true
                            if (formData.launchType === LAUNCH_TYPES.FREE) {
                              slotsAvailable = date.freeSlots
                              isDisabled = date.freeSlots <= 0
                            } else if (formData.launchType === LAUNCH_TYPES.PREMIUM) {
                              slotsAvailable = date.premiumSlots
                              isDisabled = date.premiumSlots <= 0
                            }

                            if (date.totalSlots <= 0) isDisabled = true

                            const slotsText = `${slotsAvailable} ${formData.launchType === LAUNCH_TYPES.FREE ? "free" : formData.launchType === LAUNCH_TYPES.PREMIUM ? "premium" : "premium+"} slot(s)`

                            return (
                              <SelectItem
                                key={date.date}
                                value={date.date}
                                disabled={isDisabled}
                                className="group text-sm"
                              >
                                <div className="flex w-full items-center justify-between">
                                  <span>{format(dateObj, "EEE, MMM d")}</span>
                                  <span
                                    className={`ml-2 text-xs ${isDisabled ? "text-muted-foreground/50" : "text-muted-foreground group-hover:text-foreground group-data-[highlighted]:text-foreground"}`}
                                  >
                                    {slotsText}
                                  </span>
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>

                  {launchDateLimitError && (
                    <p className="text-destructive mt-2 text-xs sm:text-sm">
                      {launchDateLimitError}
                    </p>
                  )}

                  {formData.scheduledDate && !isLaunchDateOverLimit && (
                    <div className="bg-primary/5 border-primary/10 mt-3 rounded-md border p-3 text-sm">
                      <div
                        className={`flex w-full items-center gap-1.5 ${
                          formData.launchType === LAUNCH_TYPES.FREE &&
                          (() => {
                            const today = new Date()
                            const selectedDate = parseISO(formData.scheduledDate)
                            const daysUntilLaunch = Math.ceil(
                              (selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
                            )
                            return daysUntilLaunch > LAUNCH_SETTINGS.PREMIUM_MIN_DAYS_AHEAD
                          })()
                            ? "mb-3"
                            : ""
                        }`}
                      >
                        <RiCalendarLine className="text-primary/80 h-4 w-4 flex-shrink-0" />
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-1.5">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Scheduled for</span>
                            <span className="text-foreground font-medium">
                              {format(parseISO(formData.scheduledDate), DATE_FORMAT.DISPLAY)}
                            </span>
                          </div>
                          <span className="text-muted-foreground/70 text-xs">
                            {LAUNCH_SETTINGS.LAUNCH_HOUR_UTC}:00 UTC
                          </span>
                        </div>
                      </div>

                      {formData.launchType === LAUNCH_TYPES.FREE &&
                        (() => {
                          const today = new Date()
                          const selectedDate = parseISO(formData.scheduledDate)
                          const daysUntilLaunch = Math.ceil(
                            (selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
                          )
                          const premiumEarliestDate = addDays(
                            today,
                            LAUNCH_SETTINGS.PREMIUM_MIN_DAYS_AHEAD,
                          )
                          const daysSaved = daysUntilLaunch - LAUNCH_SETTINGS.PREMIUM_MIN_DAYS_AHEAD

                          return (
                            daysUntilLaunch > LAUNCH_SETTINGS.PREMIUM_MIN_DAYS_AHEAD && (
                              <div className="border-primary/20 border-t pt-3">
                                <div className="flex items-start gap-2">
                                  <div className="flex-1 space-y-2">
                                    <p className="text-primary text-sm font-medium">
                                      Launch {daysSaved} day
                                      {daysSaved > 1 ? "s" : ""} earlier with Premium!
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                      Available from {format(premiumEarliestDate, "MMM d")} •
                                      Guaranteed DR{DOMAIN_AUTHORITY} backlink • Skip the queue
                                    </p>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        // Switch to Premium and find earliest available date
                                        setFormData((prev) => ({
                                          ...prev,
                                          launchType: LAUNCH_TYPES.PREMIUM,
                                        }))

                                        // Load premium dates and auto-select the earliest
                                        try {
                                          const startDate = format(
                                            addDays(today, LAUNCH_SETTINGS.PREMIUM_MIN_DAYS_AHEAD),
                                            DATE_FORMAT.API,
                                          )
                                          const endDate = format(
                                            addDays(today, LAUNCH_SETTINGS.PREMIUM_MAX_DAYS_AHEAD),
                                            DATE_FORMAT.API,
                                          )
                                          const availability = await getLaunchAvailabilityRange(
                                            startDate,
                                            endDate,
                                            LAUNCH_TYPES.PREMIUM,
                                          )

                                          // Find first available premium date
                                          const firstAvailableDate = availability.find(
                                            (date) => date.premiumSlots > 0 && date.totalSlots > 0,
                                          )
                                          if (firstAvailableDate) {
                                            setFormData((prev) => ({
                                              ...prev,
                                              scheduledDate: firstAvailableDate.date,
                                            }))
                                          }
                                          setAvailableDates(availability)
                                        } catch (err) {
                                          console.error("Error loading premium dates:", err)
                                          setFormData((prev) => ({
                                            ...prev,
                                            scheduledDate: null,
                                          }))
                                          loadAvailableDates()
                                        }
                                      }}
                                      className="bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                                    >
                                      <RiStarLine className="h-3 w-3" />
                                      Upgrade to Premium ${LAUNCH_SETTINGS.PREMIUM_PRICE}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )
                          )
                        })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <RiCheckLine className="h-5 w-5" />
              <h3 className="text-lg font-medium">Review and Submit</h3>
            </div>

            <div className="bg-card overflow-hidden rounded-lg border">
              <div className="space-y-6 p-6">
                <div>
                  <h4 className="mb-3 border-b pb-2 text-base font-semibold">Server Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Name:</strong> {formData.name}
                    </p>
                    <p>
                      <strong>Website:</strong>{" "}
                      <a
                        href={formData.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {formData.websiteUrl || "N/A"}
                      </a>
                    </p>
                    <p>
                      <strong>Description:</strong>
                    </p>
                    <RichTextDisplay
                      content={formData.description}
                      className="mt-1 max-h-[200px] overflow-y-auto rounded-md border p-2 text-sm"
                    />
                    <p>
                      <strong>Version:</strong> {formData.version}
                    </p>
                    <p>
                      <strong>Country:</strong> {formData.country}
                    </p>
                    {uploadedLogoUrl && (
                      <p className="flex flex-col items-start gap-2">
                        <strong>Logo:</strong>
                        <ServerLogoWithFallback
                          logoUrl={uploadedLogoUrl}
                          name={"Uploaded Logo"}
                          width={48}
                          height={48}
                          className="rounded border"
                        />
                      </p>
                    )}
                    {formData.bannerUrl && (
                      <p className="flex flex-col items-start gap-2">
                        <strong>Server Banner:</strong>
                        <ServerBannerWithLoader src={formData.bannerUrl} alt="Server banner" />
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 border-b pb-2 text-base font-semibold">Details</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong>Categories:</strong>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {formData.categories.map((catId) => (
                          <Badge key={catId} variant="secondary">
                            {getCategoryName(catId)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <strong>Mods:</strong>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {formData.mods.map((mods) => (
                          <Badge key={mods} variant="outline">
                            {mods}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {formData.discordUrl && (
                      <p>
                        <strong>Discord:</strong>{" "}
                        <a
                          href={formData.discordUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {formData.discordUrl}
                        </a>
                      </p>
                    )}
                    {formData.twitterUrl && (
                      <p>
                        <strong>Twitter:</strong>{" "}
                        <a
                          href={formData.twitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {formData.twitterUrl}
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 border-b pb-2 text-base font-semibold">Launch Plan</h4>
                  <div className="flex flex-col gap-4 text-sm sm:flex-row">
                    <div
                      className={`flex w-fit items-center gap-2 rounded-md border px-3 py-2 ${
                        formData.launchType === LAUNCH_TYPES.FREE
                          ? "bg-foreground/5 border-foreground/10"
                          : formData.launchType === LAUNCH_TYPES.PREMIUM
                            ? "bg-primary/5 border-primary/20"
                            : "bg-primary/5 border-primary/20"
                      }`}
                    >
                      {formData.launchType === LAUNCH_TYPES.FREE && (
                        <>
                          <RiRocketLine className="text-foreground/70 h-4 w-4" />{" "}
                          <span className="text-foreground/70 font-medium">Free Launch</span>
                        </>
                      )}
                      {formData.launchType === LAUNCH_TYPES.PREMIUM && (
                        <>
                          <RiStarLine className="text-primary h-4 w-4" />{" "}
                          <span className="text-primary font-medium">
                            Premium Launch (${LAUNCH_SETTINGS.PREMIUM_PRICE})
                          </span>
                        </>
                      )}
                    </div>
                    <div className="bg-muted/30 flex h-full min-h-[60px] w-fit flex-col justify-center rounded-md border px-3 py-2">
                      <div className="flex items-center gap-2">
                        <RiCalendarLine className="text-muted-foreground h-4 w-4" />
                        <span>
                          {formData.scheduledDate
                            ? format(parseISO(formData.scheduledDate), DATE_FORMAT.DISPLAY)
                            : "No date selected"}
                        </span>
                      </div>
                      {formData.scheduledDate && (
                        <span className="text-muted-foreground/70 ml-6 text-xs">
                          {LAUNCH_SETTINGS.LAUNCH_HOUR_UTC}:00 UTC
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 border-t px-6 py-4">
                <div className="flex items-start gap-3">
                  <RiInformationLine className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Ready to submit?</p>
                    <p className="text-muted-foreground text-xs">
                      Please review all information carefully. Once submitted, your server will be
                      scheduled for launch.
                      {formData.launchType !== LAUNCH_TYPES.FREE && (
                        <span className="mt-1 block">
                          You will be redirected to the payment page after submission.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sponsorship Add-ons - Outside the review card */}
            <div className="mt-8">
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <RiRocketLine className="h-5 w-5" />
                    Add Extra Visibility{" "}
                    <span className="text-neutral-500/80 text-sm">(Optional)</span>
                  </h3>
                  {SPONSORSHIP_SLOTS.TOTAL - SPONSORSHIP_SLOTS.USED > 0 && (
                    <Badge variant="default" className="border-orange-500/50 bg-orange-600">
                      {SPONSORSHIP_SLOTS.TOTAL - SPONSORSHIP_SLOTS.USED} slots left
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  Maximize your reach by adding sponsorship placement on our{" "}
                  <strong>homepage</strong> and <strong>all server pages</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Weekly Sponsorship Card */}
                <div
                  className={`relative flex flex-col overflow-hidden rounded-lg border transition-all ${
                    selectedSponsorship === "weekly"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "hover:border-primary/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-4">
                      <h4 className="mb-1 text-base font-semibold">Weekly Sponsorship</h4>
                      <p className="text-muted-foreground text-sm">
                        <span className="font-semibold">7 days</span> of homepage visibility
                      </p>
                    </div>

                    <div className="mb-4">
                      <div className="mb-1 flex items-baseline gap-1">
                        <span className="text-2xl font-bold">$9</span>
                        <span className="text-muted-foreground text-sm">/week</span>
                      </div>
                      <p className="text-muted-foreground text-xs">Perfect for launch week</p>
                    </div>

                    <ul className="mb-6 flex-1 space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <RiCheckboxCircleFill className="text-primary h-4 w-4 shrink-0" />
                        <span>Featured homepage sidebar</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <RiCheckboxCircleFill className="text-primary h-4 w-4 shrink-0" />
                        <span>Visible on all server pages</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <RiCheckboxCircleFill className="text-primary h-4 w-4 shrink-0" />
                        <span>Direct link to your website</span>
                      </li>
                    </ul>

                    <Button
                      type="button"
                      variant={selectedSponsorship === "weekly" ? "default" : "outline"}
                      className="w-full"
                      onClick={() =>
                        setSelectedSponsorship(selectedSponsorship === "weekly" ? "none" : "weekly")
                      }
                    >
                      {selectedSponsorship === "weekly" ? (
                        <>
                          <RiCheckLine className="mr-2 h-4 w-4" />
                          Added Views Boost
                        </>
                      ) : (
                        <>Add Views Boost</>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Monthly Sponsorship Card */}
                <div
                  className={`relative flex flex-col overflow-hidden rounded-lg border transition-all ${
                    selectedSponsorship === "monthly"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <Badge
                    variant="default"
                    className="bg-primary text-primary-foreground absolute top-3 right-3 text-xs"
                  >
                    Best Value
                  </Badge>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-4">
                      <h4 className="text-primary mb-1 text-base font-semibold">
                        Monthly Sponsorship
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        <span className="font-semibold">30 days</span> of homepage visibility
                      </p>
                    </div>

                    <div className="mb-4">
                      <div className="mb-1 flex items-baseline gap-1">
                        <span className="text-primary text-2xl font-bold">$29</span>
                        <span className="text-muted-foreground text-sm">/month</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-green-600">Save $7 vs weekly</p>
                        <span className="text-muted-foreground text-xs">•</span>
                        <p className="text-muted-foreground text-xs">Best value</p>
                      </div>
                    </div>

                    <ul className="mb-6 flex-1 space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <RiCheckboxCircleFill className="text-primary h-4 w-4 shrink-0" />
                        <span className="font-medium">Featured homepage sidebar</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <RiCheckboxCircleFill className="text-primary h-4 w-4 shrink-0" />
                        <span className="font-medium">Visible on all server pages</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <RiCheckboxCircleFill className="text-primary h-4 w-4 shrink-0" />
                        <span className="font-medium">Direct link to your website</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <RiCheckboxCircleFill className="text-primary h-4 w-4 shrink-0" />
                        <span className="font-medium">Priority slot consideration</span>
                      </li>
                    </ul>

                    <Button
                      type="button"
                      variant={selectedSponsorship === "monthly" ? "default" : "outline"}
                      className="w-full"
                      onClick={() =>
                        setSelectedSponsorship(
                          selectedSponsorship === "monthly" ? "none" : "monthly",
                        )
                      }
                    >
                      {selectedSponsorship === "monthly" ? (
                        <>
                          <RiCheckLine className="mr-2 h-4 w-4" />
                          Added Views Boost
                        </>
                      ) : (
                        <>Add Views Boost</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Social Proof / Value Anchor */}
              <div className="bg-muted/30 mt-4 rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <RiInformationLine className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Why add sponsorship?</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Get featured on <strong>every page of HytaleHunt</strong>, reaching thousands
                      of potential players actively searching for servers. Limited slots ensure
                      maximum visibility for your server.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Summary - Show total if sponsorship selected */}
            {formData.launchType === LAUNCH_TYPES.PREMIUM && selectedSponsorship !== "none" && (
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 mt-6 rounded-lg border border-primary/20 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-semibold">Your Launch Package</h4>
                  <Badge variant="default" className="text-xs">
                    Complete Bundle
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RiCheckboxCircleFill className="text-primary h-4 w-4" />
                      <span>Premium Launch (DR {DOMAIN_AUTHORITY} Backlink)</span>
                    </div>
                    <span className="font-medium">${LAUNCH_SETTINGS.PREMIUM_PRICE}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RiCheckboxCircleFill className="text-primary h-4 w-4" />
                      <span>
                        {selectedSponsorship === "weekly" ? "Weekly" : "Monthly"} Sponsorship
                      </span>
                    </div>
                    <span className="font-medium">
                      ${selectedSponsorship === "weekly" ? "9" : "29"}
                    </span>
                  </div>
                  <div className="border-t border-primary/20 pt-3">
                    <div className="flex items-center justify-between text-base font-bold">
                      <span>Total</span>
                      <span className="text-primary text-xl">
                        $
                        {LAUNCH_SETTINGS.PREMIUM_PRICE +
                          (selectedSponsorship === "weekly" ? 9 : 29)}
                      </span>
                    </div>
                    <p className="flex flex-row gap-1 text-muted-foreground mt-2 text-xs">
                      <RiCheckboxCircleLine className="h-4 w-4" />
                      Maximum visibility package for your server launch
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {renderStepper()}

      {renderStepContent()}

      {error && (
        <div className="bg-destructive/10 border-destructive/30 text-destructive rounded-md border p-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1 || isPending || isUploadingLogo || isUploadingBannerUrl}
        >
          <RiArrowLeftLine className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {currentStep < 4 ? (
          <Button
            type="button"
            onClick={nextStep}
            disabled={
              isPending ||
              isUploadingLogo ||
              isUploadingBannerUrl ||
              (currentStep === 3 && isLoadingDateCheck)
            }
          >
            {currentStep === 3 && isLoadingDateCheck && (
              <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
            )}
            Next
            <RiArrowRightLine className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleFinalSubmit}
            disabled={isPending || isUploadingLogo || isUploadingBannerUrl}
          >
            {isPending ? (
              <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RiRocketLine className="mr-2 h-4 w-4" />
            )}
            Submit Server
          </Button>
        )}
      </div>
    </form>
  )
}
