import { useMemo, useState } from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { LineChart } from "react-native-gifted-charts"

import type { UserStats } from "@/lib/api/schemas"

type PeriodFilter = "all" | "weekly" | "monthly" | "yearly"

interface StatsSectionProps {
  stats: UserStats
}

const filters: { key: PeriodFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "weekly", label: "Week" },
  { key: "monthly", label: "Month" },
  { key: "yearly", label: "Year" },
]

export function StatsSection({ stats }: StatsSectionProps) {
  const [period, setPeriod] = useState<PeriodFilter>("all")

  const chartData = useMemo(() => {
    if (period === "weekly") {
      const total = stats.weekly.questsCompleted
      return [
        { value: Math.max(0, Math.round(total * 0.1)), label: "Sun", dataPointText: "" },
        { value: Math.max(0, Math.round(total * 0.15)), label: "Mon", dataPointText: "" },
        { value: Math.max(0, Math.round(total * 0.2)), label: "Tue", dataPointText: "" },
        { value: Math.max(0, Math.round(total * 0.25)), label: "Wed", dataPointText: "" },
        { value: Math.max(0, Math.round(total * 0.15)), label: "Thu", dataPointText: "" },
        { value: Math.max(0, Math.round(total * 0.1)), label: "Fri", dataPointText: "" },
        { value: Math.max(0, Math.round(total * 0.05)), label: "Sat", dataPointText: total.toString() },
      ]
    }

    if (period === "monthly") {
      const total = stats.monthly.questsCompleted
      return [
        { value: Math.max(0, Math.round(total * 0.2)), label: "W1", dataPointText: "" },
        { value: Math.max(0, Math.round(total * 0.25)), label: "W2", dataPointText: "" },
        { value: Math.max(0, Math.round(total * 0.3)), label: "W3", dataPointText: "" },
        { value: Math.max(0, Math.round(total * 0.25)), label: "W4", dataPointText: total.toString() },
      ]
    }

    if (period === "yearly") {
      const total = stats.yearly.questsCompleted
      return [
        { value: Math.max(0, Math.round(total * 0.05)), label: "Jan", dataPointText: "" },
        { value: Math.max(0, Math.round(total * 0.08)), label: "Feb", dataPointText: "" },
        { value: Math.max(0, Math.round(total * 0.1)), label: "Mar", dataPointText: "" },
        { value: Math.max(0, Math.round(total * 0.1)), label: "Apr", dataPointText: "" },
        { value: Math.max(0, Math.round(total * 0.12)), label: "May", dataPointText: "" },
        { value: Math.max(0, Math.round(total * 0.12)), label: "Jun", dataPointText: "" },
        { value: Math.max(0, Math.round(total * 0.1)), label: "Jul", dataPointText: "" },
        { value: Math.max(0, Math.round(total * 0.08)), label: "Aug", dataPointText: "" },
        { value: Math.max(0, Math.round(total * 0.08)), label: "Sep", dataPointText: "" },
        { value: Math.max(0, Math.round(total * 0.07)), label: "Oct", dataPointText: "" },
        { value: Math.max(0, Math.round(total * 0.05)), label: "Nov", dataPointText: "" },
        { value: Math.max(0, Math.round(total * 0.05)), label: "Dec", dataPointText: total.toString() },
      ]
    }

    // All - show years
    const total = stats.allTime.questsCompleted
    const currentYear = new Date().getFullYear()
    return [
      { value: Math.max(0, Math.round(total * 0.1)), label: (currentYear - 3).toString(), dataPointText: "" },
      { value: Math.max(0, Math.round(total * 0.2)), label: (currentYear - 2).toString(), dataPointText: "" },
      { value: Math.max(0, Math.round(total * 0.3)), label: (currentYear - 1).toString(), dataPointText: "" },
      { value: total, label: currentYear.toString(), dataPointText: total.toString() },
    ]
  }, [stats, period])

  const maxValue = useMemo(() => {
    return Math.max(...chartData.map((d) => d.value), 1)
  }, [chartData])

  return (
    <View className="gap-4 py-4">
      {/* Period Filter */}
      <View className="flex-row gap-2">
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setPeriod(f.key)}
            className={`rounded-md px-3 py-1.5 ${
              period === f.key
                ? "bg-surface-card dark:bg-surface-dark-elevated"
                : ""
            }`}
          >
            <Text
              className={`font-body-medium text-caption ${
                period === f.key
                  ? "text-ink dark:text-on-dark"
                  : "text-muted"
              }`}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Line Chart - inside card */}
      <View className="gap-3 rounded-lg bg-surface-card p-3 dark:bg-surface-dark">
        <Text className="font-body-medium text-caption text-muted px-1">
          Quest Completions
        </Text>
        <View className="items-center">
          <LineChart
            areaChart
            data={chartData}
            width={300}
            height={160}
            maxValue={maxValue * 1.2}
            noOfSections={3}
            spacing={65}
            initialSpacing={10}
            color="#cc785c"
            startFillColor="#cc785c"
            endFillColor="#cc785c"
            startOpacity={0.2}
            endOpacity={0.02}
            thickness={2}
            dataPointsColor="#cc785c"
            dataPointsRadius={3}
            textColor="#141413"
            textFontSize={10}
            hideRules
            hideYAxisText
            xAxisLabelTextStyle={{ fontSize: 10, color: "#6c6a64" }}
            xAxisColor="#e6dfd8"
            yAxisColor="transparent"
          />
        </View>
      </View>
    </View>
  )
}
