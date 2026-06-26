import Feather from "@expo/vector-icons/Feather"
import Ionicons from "@expo/vector-icons/Ionicons"
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs"
import { useColorScheme } from "react-native"

export default function TabLayout() {
  const colorScheme = useColorScheme()
  return (
    <NativeTabs
      tintColor="#cc785c"
      backgroundColor={colorScheme === "dark" ? "#181715" : "#faf9f5"}
      disableTransparentOnScrollEdge
    >
      <NativeTabs.Trigger name="index">
        <Label>Quest</Label>
        <Icon
          sf="target"
          androidSrc={<VectorIcon family={Feather} name="target" />}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="shop">
        <Label>Shop</Label>
        <Icon
          sf="bag.fill"
          androidSrc={<VectorIcon family={Ionicons} name="bag" />}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="inventory">
        <Label>Inventory</Label>
        <Icon
          sf="archivebox.fill"
          androidSrc={<VectorIcon family={Ionicons} name="archive" />}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="guild">
        <Label>Guild</Label>
        <Icon
          sf="person.3.fill"
          androidSrc={<VectorIcon family={Ionicons} name="people" />}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon
          sf="person.fill"
          androidSrc={<VectorIcon family={Ionicons} name="person" />}
        />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
