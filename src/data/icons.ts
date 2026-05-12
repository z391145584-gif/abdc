import {
  Ticket, Trophy, Percent, ShoppingCart, Gift, Tag,
  Volume2, Music, Mic, Clock,
  ClipboardList, FileCheck, Shield, Paintbrush, Truck,
  PackageCheck, Eye, Megaphone, Users, CalendarCheck,
  PartyPopper, BarChart3, Smartphone, Store,
  DollarSign, Package, ShoppingBag,
  type LucideIcon,
} from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  Ticket, Trophy, Percent, ShoppingCart, Gift, Tag,
  Volume2, Music, Mic, Clock,
  ClipboardList, FileCheck, Shield, Paintbrush, Truck,
  PackageCheck, Eye, Megaphone, Users, CalendarCheck,
  PartyPopper, BarChart3, Smartphone, Store,
  DollarSign, Package, ShoppingBag,
}

export function getIcon(name: string): LucideIcon {
  return iconMap[name] || ClipboardList
}