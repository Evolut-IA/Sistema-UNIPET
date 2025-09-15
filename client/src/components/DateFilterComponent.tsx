import * as React from "react"
import { CalendarDate } from "@internationalized/date"
import { Calendar as CalendarIcon, X, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useDateFilter, type DateRange } from "@/hooks/use-date-filter"
import { formatDateRangeForDisplay } from "@/lib/date-utils"
import { cn } from "@/lib/utils"

export interface DateFilterComponentProps {
  onDateRangeChange?: (startDate: CalendarDate | null, endDate: CalendarDate | null) => void
  isLoading?: boolean
  className?: string
  initialRange?: DateRange
}

const DateFilterComponent = React.memo(function DateFilterComponent({
  onDateRangeChange,
  isLoading = false,
  className,
  initialRange
}: DateFilterComponentProps) {
  const {
    dateRange,
    setDateRange,
    clearFilter,
    isFiltering,
    isValidRange,
    errorMessage
  } = useDateFilter(initialRange)

  const handleDateRangeChange = React.useCallback((range: DateRange) => {
    setDateRange(range)
    onDateRangeChange?.(range.startDate, range.endDate)
  }, [setDateRange, onDateRangeChange])

  const handleClearFilter = React.useCallback(() => {
    clearFilter()
    onDateRangeChange?.(null, null)
  }, [clearFilter, onDateRangeChange])

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <h3 className="text-sm font-medium text-foreground">
                Filtrar por período
              </h3>
            </div>
            {isFiltering && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilter}
                className="h-8 px-2 text-xs w-full xs:w-auto"
                disabled={isLoading}
              >
                <X className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          {/* Date Range Picker */}
          <div className="space-y-2">
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              placeholder="Selecionar período"
              disabled={isLoading}
              className="w-full"
            />
            
            {/* Error Message */}
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription className="text-xs">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Active Filter Display */}
          {isFiltering && isValidRange && (
            <div className="flex items-start sm:items-center gap-2 p-2 bg-primary/10 rounded-md">
              <CalendarIcon className="h-3 w-3 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
              <span className="text-xs text-primary font-medium break-words">
                Período ativo: {formatDateRangeForDisplay(dateRange.startDate, dateRange.endDate)}
              </span>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                Aplicando filtro...
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

export { DateFilterComponent }