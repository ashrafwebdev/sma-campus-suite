import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { ErrorNote, Field, PrimaryButton, SecondaryButton, SectionCard, Table, TableToolbar } from '../../components/ui'
import {
  SUBJECT_TYPE,
  type SchoolClass,
  type SchoolClassCreate,
  type Section,
  type SectionCreate,
  type Subject,
  type SubjectCreate,
  type User,
} from '../../types/api'

function ClassesSection() {
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<SchoolClassCreate>({ name: '', order: 0 })
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => (await api.get<SchoolClass[]>('/academic/classes')).data,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['classes'] })

  const createMutation = useMutation({
    mutationFn: async (payload: SchoolClassCreate) => (await api.post('/academic/classes', payload)).data,
    onSuccess: () => {
      invalidate()
      setName('')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: SchoolClassCreate }) =>
      (await api.put(`/academic/classes/${id}`, payload)).data,
    onSuccess: () => {
      invalidate()
      setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/academic/classes/${id}`),
    onSuccess: invalidate,
  })

  function startEdit(c: SchoolClass) {
    setEditingId(c.id)
    setEditForm({ name: c.name, order: c.order })
  }

  function handleDelete(id: number) {
    if (window.confirm('Delete this class? This cannot be undone.')) deleteMutation.mutate(id)
  }

  return (
    <SectionCard
      title="Classes"
      description="Grades / year levels, e.g. Class 5, Grade 10."
      action={
        <TableToolbar
          title="Classes"
          filename="classes"
          rows={data}
          columns={[
            { label: 'Name', value: (c) => c.name },
            { label: 'Order', value: (c) => c.order },
          ]}
        />
      }
    >
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          createMutation.mutate({ name })
        }}
        className="mb-4 flex items-end gap-2"
      >
        <div className="flex-1">
          <Field label="Class name" required>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="e.g. Class 5" />
          </Field>
        </div>
        <PrimaryButton type="submit" disabled={createMutation.isPending}>
          + Add
        </PrimaryButton>
      </form>
      <ErrorNote error={createMutation.error ?? updateMutation.error ?? deleteMutation.error} />
      <Table columns={['Name', 'Order', '']} isLoading={isLoading} error={error} isEmpty={data?.length === 0}>
        {data?.map((c) =>
          editingId === c.id ? (
            <tr key={c.id} className="bg-slate-50">
              <td className="px-4 py-3">
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="input"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  value={editForm.order ?? 0}
                  onChange={(e) => setEditForm((f) => ({ ...f, order: Number(e.target.value) }))}
                  className="input"
                />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <PrimaryButton
                    onClick={() => updateMutation.mutate({ id: c.id, payload: editForm })}
                    disabled={updateMutation.isPending}
                  >
                    Save
                  </PrimaryButton>
                  <SecondaryButton onClick={() => setEditingId(null)}>Cancel</SecondaryButton>
                </div>
              </td>
            </tr>
          ) : (
            <tr key={c.id}>
              <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
              <td className="px-4 py-3 text-slate-600">{c.order}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <SecondaryButton onClick={() => startEdit(c)}>Edit</SecondaryButton>
                  <SecondaryButton onClick={() => handleDelete(c.id)} disabled={deleteMutation.isPending}>
                    Delete
                  </SecondaryButton>
                </div>
              </td>
            </tr>
          ),
        )}
      </Table>
    </SectionCard>
  )
}

function SectionsSection() {
  const [form, setForm] = useState<SectionCreate>({ name: '', capacity: 40, class_id: 0 })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<SectionCreate>({ name: '', capacity: 40, class_id: 0 })
  const queryClient = useQueryClient()

  const classesQuery = useQuery({
    queryKey: ['classes'],
    queryFn: async () => (await api.get<SchoolClass[]>('/academic/classes')).data,
  })

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get<User[]>('/users')).data,
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => (await api.get<Section[]>('/academic/sections')).data,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['sections'] })

  const createMutation = useMutation({
    mutationFn: async (payload: SectionCreate) => (await api.post('/academic/sections', payload)).data,
    onSuccess: () => {
      invalidate()
      setForm({ name: '', capacity: 40, class_id: 0 })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: SectionCreate }) =>
      (await api.put(`/academic/sections/${id}`, payload)).data,
    onSuccess: () => {
      invalidate()
      setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/academic/sections/${id}`),
    onSuccess: invalidate,
  })

  const classById = new Map((classesQuery.data ?? []).map((c) => [c.id, c.name]))
  const userById = new Map((usersQuery.data ?? []).map((u) => [u.id, u.name]))

  function startEdit(s: Section) {
    setEditingId(s.id)
    setEditForm({ name: s.name, capacity: s.capacity, class_id: s.class_id, teacher_id: s.teacher_id })
  }

  function handleDelete(id: number) {
    if (window.confirm('Delete this section? This cannot be undone.')) deleteMutation.mutate(id)
  }

  return (
    <SectionCard
      title="Sections"
      description="Subdivisions of a class, e.g. Section A, Section B."
      action={
        <TableToolbar
          title="Sections"
          filename="sections"
          rows={data}
          columns={[
            { label: 'Name', value: (s) => s.name },
            { label: 'Class', value: (s) => classById.get(s.class_id) ?? `#${s.class_id}` },
            { label: 'Capacity', value: (s) => s.capacity },
            { label: 'Teacher', value: (s) => (s.teacher_id ? userById.get(s.teacher_id) ?? `#${s.teacher_id}` : '') },
          ]}
        />
      }
    >
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          if (!form.class_id) return
          createMutation.mutate(form)
        }}
        className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5"
      >
        <Field label="Name" required>
          <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" placeholder="e.g. A" />
        </Field>
        <Field label="Class" required>
          <select
            required
            value={form.class_id || ''}
            onChange={(e) => setForm((f) => ({ ...f, class_id: Number(e.target.value) }))}
            className="input"
          >
            <option value="">Select…</option>
            {classesQuery.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Capacity">
          <input
            type="number"
            min={1}
            value={form.capacity ?? 40}
            onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
            className="input"
          />
        </Field>
        <Field label="Teacher">
          <select
            value={form.teacher_id ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, teacher_id: e.target.value ? Number(e.target.value) : null }))}
            className="input"
          >
            <option value="">Unassigned</option>
            {usersQuery.data?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex items-end">
          <PrimaryButton type="submit" disabled={createMutation.isPending} className="w-full">
            + Add
          </PrimaryButton>
        </div>
      </form>
      <ErrorNote error={createMutation.error ?? updateMutation.error ?? deleteMutation.error} />
      <Table columns={['Name', 'Class', 'Capacity', 'Teacher', '']} isLoading={isLoading} error={error} isEmpty={data?.length === 0}>
        {data?.map((s) =>
          editingId === s.id ? (
            <tr key={s.id} className="bg-slate-50">
              <td className="px-4 py-3">
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="input"
                />
              </td>
              <td className="px-4 py-3">
                <select
                  value={editForm.class_id}
                  onChange={(e) => setEditForm((f) => ({ ...f, class_id: Number(e.target.value) }))}
                  className="input"
                >
                  {classesQuery.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  value={editForm.capacity ?? 40}
                  onChange={(e) => setEditForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
                  className="input"
                />
              </td>
              <td className="px-4 py-3">
                <select
                  value={editForm.teacher_id ?? ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, teacher_id: e.target.value ? Number(e.target.value) : null }))}
                  className="input"
                >
                  <option value="">Unassigned</option>
                  {usersQuery.data?.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <PrimaryButton
                    onClick={() => updateMutation.mutate({ id: s.id, payload: editForm })}
                    disabled={updateMutation.isPending}
                  >
                    Save
                  </PrimaryButton>
                  <SecondaryButton onClick={() => setEditingId(null)}>Cancel</SecondaryButton>
                </div>
              </td>
            </tr>
          ) : (
            <tr key={s.id}>
              <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
              <td className="px-4 py-3 text-slate-600">{classById.get(s.class_id) ?? `#${s.class_id}`}</td>
              <td className="px-4 py-3 text-slate-600">{s.capacity}</td>
              <td className="px-4 py-3 text-slate-600">
                {s.teacher_id ? userById.get(s.teacher_id) ?? `#${s.teacher_id}` : '—'}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <SecondaryButton onClick={() => startEdit(s)}>Edit</SecondaryButton>
                  <SecondaryButton onClick={() => handleDelete(s.id)} disabled={deleteMutation.isPending}>
                    Delete
                  </SecondaryButton>
                </div>
              </td>
            </tr>
          ),
        )}
      </Table>
    </SectionCard>
  )
}

function SubjectsSection() {
  const [form, setForm] = useState<SubjectCreate>({ name: '', code: '', subject_type: 1, class_id: 0 })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<SubjectCreate>({ name: '', code: '', subject_type: 1, class_id: 0 })
  const queryClient = useQueryClient()

  const classesQuery = useQuery({
    queryKey: ['classes'],
    queryFn: async () => (await api.get<SchoolClass[]>('/academic/classes')).data,
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => (await api.get<Subject[]>('/academic/subjects')).data,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['subjects'] })

  const createMutation = useMutation({
    mutationFn: async (payload: SubjectCreate) => (await api.post('/academic/subjects', payload)).data,
    onSuccess: () => {
      invalidate()
      setForm({ name: '', code: '', subject_type: 1, class_id: 0 })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: SubjectCreate }) =>
      (await api.put(`/academic/subjects/${id}`, payload)).data,
    onSuccess: () => {
      invalidate()
      setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/academic/subjects/${id}`),
    onSuccess: invalidate,
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.class_id) return
    createMutation.mutate(form)
  }

  function startEdit(s: Subject) {
    setEditingId(s.id)
    setEditForm({ name: s.name, code: s.code, subject_type: s.subject_type, class_id: s.class_id })
  }

  function handleDelete(id: number) {
    if (window.confirm('Delete this subject? This cannot be undone.')) deleteMutation.mutate(id)
  }

  const classById = new Map((classesQuery.data ?? []).map((c) => [c.id, c.name]))

  return (
    <SectionCard
      title="Subjects"
      description="Belong to a class; used by exam rules."
      action={
        <TableToolbar
          title="Subjects"
          filename="subjects"
          rows={data}
          columns={[
            { label: 'Name', value: (s) => s.name },
            { label: 'Code', value: (s) => s.code },
            { label: 'Class', value: (s) => classById.get(s.class_id) ?? `#${s.class_id}` },
            { label: 'Type', value: (s) => SUBJECT_TYPE[s.subject_type] },
          ]}
        />
      }
    >
      <form onSubmit={handleSubmit} className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Name" required>
          <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" />
        </Field>
        <Field label="Code" required>
          <input required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="input" />
        </Field>
        <Field label="Class" required>
          <select
            required
            value={form.class_id || ''}
            onChange={(e) => setForm((f) => ({ ...f, class_id: Number(e.target.value) }))}
            className="input"
          >
            <option value="">Select…</option>
            {classesQuery.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex items-end">
          <PrimaryButton type="submit" disabled={createMutation.isPending} className="w-full">
            + Add
          </PrimaryButton>
        </div>
      </form>
      <ErrorNote error={createMutation.error ?? updateMutation.error ?? deleteMutation.error} />
      <Table columns={['Name', 'Code', 'Class', 'Type', '']} isLoading={isLoading} error={error} isEmpty={data?.length === 0}>
        {data?.map((s) =>
          editingId === s.id ? (
            <tr key={s.id} className="bg-slate-50">
              <td className="px-4 py-3">
                <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className="input" />
              </td>
              <td className="px-4 py-3">
                <input value={editForm.code} onChange={(e) => setEditForm((f) => ({ ...f, code: e.target.value }))} className="input" />
              </td>
              <td className="px-4 py-3 text-slate-600">{classById.get(s.class_id) ?? `#${s.class_id}`}</td>
              <td className="px-4 py-3">
                <select
                  value={editForm.subject_type ?? 1}
                  onChange={(e) => setEditForm((f) => ({ ...f, subject_type: Number(e.target.value) }))}
                  className="input"
                >
                  {Object.entries(SUBJECT_TYPE).map(([v, label]) => (
                    <option key={v} value={v}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <PrimaryButton
                    onClick={() => updateMutation.mutate({ id: s.id, payload: { ...editForm, class_id: s.class_id } })}
                    disabled={updateMutation.isPending}
                  >
                    Save
                  </PrimaryButton>
                  <SecondaryButton onClick={() => setEditingId(null)}>Cancel</SecondaryButton>
                </div>
              </td>
            </tr>
          ) : (
            <tr key={s.id}>
              <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.code}</td>
              <td className="px-4 py-3 text-slate-600">{classById.get(s.class_id) ?? `#${s.class_id}`}</td>
              <td className="px-4 py-3 text-slate-600">{SUBJECT_TYPE[s.subject_type]}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <SecondaryButton onClick={() => startEdit(s)}>Edit</SecondaryButton>
                  <SecondaryButton onClick={() => handleDelete(s.id)} disabled={deleteMutation.isPending}>
                    Delete
                  </SecondaryButton>
                </div>
              </td>
            </tr>
          ),
        )}
      </Table>
    </SectionCard>
  )
}

export function AcademicPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Academic Structure</h1>
      <p className="mt-1 text-sm text-slate-500">Classes, sections, and subjects, used across enrollment and exams.</p>
      <div className="mt-6 space-y-6">
        <ClassesSection />
        <SectionsSection />
        <SubjectsSection />
      </div>
    </div>
  )
}
