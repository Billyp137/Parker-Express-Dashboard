const STATUS_STYLES = {
  'Delivered':        'bg-green-950 text-green-400 border-green-900',
  'In Transit':       'bg-blue-950 text-blue-400 border-blue-900',
  'Out for Delivery': 'bg-sky-950 text-sky-300 border-sky-900',
  'Pending':          'bg-yellow-950 text-yellow-400 border-yellow-900',
  'Exception':        'bg-red-950 text-red-400 border-red-900',
  'Cancelled':        'bg-zinc-900 text-zinc-500 border-zinc-800',
}

export default function StatusPill({ status }) {
  const style = STATUS_STYLES[status] || 'bg-zinc-900 text-zinc-400 border-zinc-800'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {status}
    </span>
  )
}
