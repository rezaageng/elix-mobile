import { useState } from "react"
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"

type PickerMode = "time" | "datetime" | "weekday"

interface NativeDateTimePickerProps {
  value?: Date
  onChange: (date?: Date) => void
  label?: string
  mode?: PickerMode
}

const WEEKDAYS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
]

export function NativeDateTimePicker({
  value,
  onChange,
  label = "Start Time",
  mode = "datetime",
}: NativeDateTimePickerProps) {
  const [showModal, setShowModal] = useState(false)
  const [showAndroidPicker, setShowAndroidPicker] = useState(false)
  const [temporaryDate, setTemporaryDate] = useState(value ?? new Date())

  const handleOpen = () => {
    setTemporaryDate(value ?? new Date())
    if (Platform.OS === "ios") {
      setShowModal(true)
    } else {
      setShowAndroidPicker(true)
    }
  }

  const handleConfirm = () => {
    onChange(temporaryDate)
    setShowModal(false)
  }

  const handleClear = () => {
    onChange()
    setShowModal(false)
  }

  const handleCancel = () => {
    setShowModal(false)
  }

  const formatDate = (date: Date) => {
    if (mode === "time") {
      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    }
    if (mode === "weekday") {
      const dayName = date.toLocaleDateString(undefined, { weekday: "short" })
      const time = date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
      return `${dayName} ${time}`
    }
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const displayLabel = () => {
    if (value) return formatDate(value)
    return `${label} (optional)`
  }

  const selectedWeekday = temporaryDate.getDay()

  const updateWeekday = (weekday: number) => {
    const updated = new Date(temporaryDate)
    const currentDay = updated.getDay()
    const diff = weekday - currentDay
    updated.setDate(updated.getDate() + diff)
    setTemporaryDate(updated)
  }

  return (
    <>
      <TouchableOpacity
        onPress={handleOpen}
        className="flex-row items-center justify-between rounded-md border border-hairline bg-canvas px-sm py-1.5 dark:border-hairline dark:bg-surface-dark"
      >
        <Text className="font-body text-md text-ink dark:text-on-dark">
          {displayLabel()}
        </Text>
        <Text className="font-body text-caption text-muted dark:text-on-dark-soft">
          {value ? "Change" : "Add"}
        </Text>
      </TouchableOpacity>

      {Platform.OS === "ios" && (
        <Modal
          visible={showModal}
          transparent
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <Pressable
            className="flex-1 justify-end bg-black/40"
            onPress={handleCancel}
          >
            <View className="rounded-t-xl bg-canvas p-lg dark:bg-surface-dark">
              <View className="mb-sm flex-row items-center justify-between">
                <TouchableOpacity onPress={handleCancel}>
                  <Text className="font-body-medium text-body-sm text-muted dark:text-on-dark-soft">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text className="font-body-semibold text-body-sm text-ink dark:text-on-dark">
                  {label}
                </Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text className="font-body-medium text-body-sm text-primary">
                    Done
                  </Text>
                </TouchableOpacity>
              </View>

              {mode === "weekday" && (
                <View className="mb-md">
                  <Text className="mb-sm font-body-medium text-body-sm text-ink dark:text-on-dark">
                    Day of Week
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                  >
                    {WEEKDAYS.map((day) => (
                      <TouchableOpacity
                        key={day.value}
                        onPress={() => updateWeekday(day.value)}
                        className={`items-center rounded-md px-md py-sm ${selectedWeekday === day.value ? "bg-primary" : "bg-surface-soft dark:bg-surface-dark-soft"}`}
                      >
                        <Text
                          className={`font-body-medium text-body-sm ${selectedWeekday === day.value ? "text-primary-foreground" : "text-ink dark:text-on-dark"}`}
                        >
                          {day.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <DateTimePicker
                value={temporaryDate}
                mode={mode === "weekday" ? "time" : mode}
                display="spinner"
                onChange={(_, selectedDate) => {
                  if (selectedDate) {
                    setTemporaryDate(selectedDate)
                  }
                }}
              />

              {value && (
                <TouchableOpacity
                  onPress={handleClear}
                  className="mt-sm items-center rounded-md border border-error/30 py-sm"
                >
                  <Text className="font-body-medium text-body-sm text-error">
                    Clear
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Modal>
      )}

      {Platform.OS === "android" && showAndroidPicker && (
        <>
          {mode === "weekday" && (
            <View className="mb-sm flex-row flex-wrap gap-xs">
              {WEEKDAYS.map((day) => (
                <TouchableOpacity
                  key={day.value}
                  onPress={() => updateWeekday(day.value)}
                  className={`items-center rounded-md px-md py-sm ${selectedWeekday === day.value ? "bg-primary" : "bg-surface-soft dark:bg-surface-dark-soft"}`}
                >
                  <Text
                    className={`font-body-medium text-body-sm ${selectedWeekday === day.value ? "text-primary-foreground" : "text-ink dark:text-on-dark"}`}
                  >
                    {day.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <DateTimePicker
            value={temporaryDate}
            mode={mode === "weekday" ? "time" : mode}
            display="default"
            onChange={(_, selectedDate) => {
              if (mode !== "weekday") {
                setShowAndroidPicker(false)
              }
              if (selectedDate) {
                onChange(selectedDate)
              }
            }}
          />
        </>
      )}

      {value && Platform.OS === "android" && (
        <TouchableOpacity
          onPress={() => onChange()}
          className="mt-xs items-center rounded-md py-xs"
        >
          <Text className="font-body text-caption text-error">Clear</Text>
        </TouchableOpacity>
      )}
    </>
  )
}
