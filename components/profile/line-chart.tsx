import { useMemo } from "react"
import { Text, View } from "react-native"
import { LineChart } from "react-native-gifted-charts"

import type { BaseStats } from "@/lib/api/schemas"

type PeriodKey = "weekly" | "monthly" | "yearly" | "allTime"

interface StatsLineChartProps {
  stats: Record<PeriodKey, BaseStats>
  metric: "questsCompleted" | "questsInProgress" | "questsNotStarted"
}

const periodLabels: Record<PeriodKey, string> = {
  weekly: "Week",
  monthly: "Month",
  yearly: "Year",
  allTime: "All",
}

export function StatsLineChart({ stats, metric }: StatsLineChartProps) {
  const data = useMemo(() => {
    const periods: PeriodKey[] = ["weekly", "monthly", "yearly", "allTime"]
    return periods.map((period) => ({
      value: stats[period][metric],
      label: periodLabels[period],
      dataPointText: stats[period][metric].toString(),
    }))
  }, [stats, metric])

  const maxValue = useMemo(() => {
    return Math.max(...data.map((d) => d.value), 1)
  }, [data])

  return (
    <View className="gap-3">
      <Text className="font-body-medium text-body-sm text-ink dark:text-on-dark">
        Quests{" "}
        {metric === "questsCompleted"
          ? "Completed"
          : (metric === "questsInProgress" ? "In Progress" : "Not Started")}
      </Text>
      <View className="items-center">
        <LineChart
          areaChart
          data={data}
          width={280}
          height={160}
          maxValue={maxValue * 1.2}
          noOfSections={4}
          spacing={70}
          initialSpacing={20}
          color="#cc785c"
          startFillColor="#cc785c"
          endFillColor="#cc785c"
          startOpacity={0.3}
          endOpacity={0.05}
          thickness={2}
          dataPointsColor="#cc785c"
          dataPointsRadius={4}
          textColor="#141413"
          textFontSize={10}
          hideRules
          hideYAxisText
          xAxisLabelTextStyle={{ fontSize: 10, color: "#666" }}
          xAxisColor="#e5e5e5"
          yAxisColor="transparent"
        />
      </View>
    </View>
  )
}
