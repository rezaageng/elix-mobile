import { useMemo, useState } from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { LineChart } from "react-native-gifted-charts"

import type { UserStats } from "@/lib/api/schemas"

type PeriodFilter = "all" | "weekly" | "yearly"

interface StatsSectionProps {
  stats: UserStats
}

const filters: { key: PeriodFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "weekly", label: "Week" },
  { key: "yearly", label: "Year" },
]

export function StatsSection({ stats }: StatsSectionProps) {
  const [period, setPeriod] = useState<PeriodFilter>("all")

  const chartData = useMemo(() => {
    const timeline = stats.timeline?.[period]
    if (timeline && timeline.length > 0) {
      return timeline.map((point, index) => ({
        value: point.value,
        label: point.label,
        dataPointText: index === timeline.length - 1 ? point.value.toString() : "",
      }))
    }

    // Fallback for older backend responses: show the period total as a single point
    const totals: Record<PeriodFilter, number> = {
      all: stats.allTime.questsCompleted,
      weekly: stats.weekly.questsCompleted,
      yearly: stats.yearly.questsCompleted,
    }
    const total = totals[period]

    return [{ value: total, label: "", dataPointText: total.toString() }]
  }, [stats, period])

  const maxValue = useMemo(() => {
    return Math.max(...chartData.map((d) => d.value), 1)
  }, [chartData])

  const spacing = chartData.length > 1 ? 250 / (chartData.length - 1) : 65

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
      <View className="gap-3 rounded-lg bg-surface-card p-3 dark:bg-surface-dark-elevated">
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
            noOfSections={4}
            spacing={spacing}
            initialSpacing={25}
            rotateLabel
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
            focusEnabled
            showDataPointLabelOnFocus
            unFocusOnPressOut={false}
            focusedDataPointColor="#cc785c"
            focusedDataPointRadius={5}
            focusedDataPointLabelComponent={(item: { value: number }) => (
              <View className="rounded-md bg-primary px-1.5 py-0.5">
                <Text className="font-body-bold text-caption text-primary-foreground">
                  {item.value}
                </Text>
              </View>
            )}
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
