import React, { useState, useMemo } from 'react'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

export interface Column<T = any> {
  key: string
  title: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  width?: string
}

interface DataTableProps<T = any> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  searchable?: boolean
  sortable?: boolean
  pagination?: boolean
  pageSize?: number
  onRowClick?: (row: T) => void
  actions?: (row: T) => React.ReactNode
}

const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  searchable = true,
  sortable = true,
  pagination = true,
  pageSize = 10,
  onRowClick,
  actions
}: DataTableProps<T>) => {
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!search) return data

    return data.filter(row =>
      columns.some(column => {
        const value = row[column.key]
        return value?.toString().toLowerCase().includes(search.toLowerCase())
      })
    )
  }, [data, search, columns])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [filteredData, sortConfig])

  // Paginate data  
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData

    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize, pagination])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (key: string) => {
    if (!sortable) return

    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <div className="w-4 h-4" />
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUpIcon className="w-4 h-4" />
      : <ChevronDownIcon className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-t-lg"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 border-t border-gray-200"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header with search and filters */}
      {searchable && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Zoeken..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <button className="ml-4 p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md">
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable !== false && sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center justify-between">
                    <span>{column.title}</span>
                    {column.sortable !== false && sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acties
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(row)}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {paginatedData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Geen gegevens gevonden</p>
        </div>
      )}

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Vorige
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Volgende
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Toont <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> tot{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, sortedData.length)}
                </span>{' '}
                van <span className="font-medium">{sortedData.length}</span> resultaten
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Vorige
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === i + 1
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Volgende
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable