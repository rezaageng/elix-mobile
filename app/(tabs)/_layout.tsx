import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs"

export default function TabLayout() {
  return (
    <NativeTabs tintColor="#b96647">
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" drawable="custom_home_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="quest">
        <Label>Quest</Label>
        <Icon sf="target" drawable="custom_quest_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="guild">
        <Label>Guild</Label>
        <Icon sf="person.3.fill" drawable="custom_guild_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf="person.fill" drawable="custom_profile_drawable" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
