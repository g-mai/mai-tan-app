import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/teams/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/teams/"!</div>
}
