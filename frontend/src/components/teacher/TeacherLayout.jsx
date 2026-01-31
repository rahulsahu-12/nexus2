import TeacherSidebar from "./TeacherSidebar";

export default function TeacherLayout({ children, setPage }) {
  // ✅ fallback so app never crashes
  const safeSetPage = setPage || (() => {});

  return (
    <div className="relative min-h-screen font-sans text-slate-800">

      {/* 📜 PARCHMENT BASE */}
      <div
        className="
          fixed inset-0 -z-20
          bg-[#FAF9F6]
        "
      />

      {/* ✨ SUBTLE PAPER TEXTURE */}
      <div
        className="
          fixed inset-0 -z-10
          bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.02)_1px,transparent_0)]
          bg-[length:24px_24px]
          opacity-20
          pointer-events-none
        "
      />

      {/* 🧱 LAYOUT */}
      <div className="flex min-h-screen">

        {/* 📚 SIDEBAR */}
        <aside className="fixed left-0 top-0 h-screen w-64 z-30">
          <TeacherSidebar setPage={safeSetPage} />
        </aside>

        {/* 🧠 MAIN CONTENT */}
        <main className="ml-64 flex-1 px-10 py-8">
          <div
            className="
              max-w-7xl mx-auto
              bg-[#FDFCF9]
              rounded-2xl
              p-8
              border
              border-[#F4E9CF]
              shadow-[0_12px_34px_rgba(0,0,0,0.08)]
              relative
            "
          >
            {/* 🟨 GOLD TOP ACCENT */}
            <div
              className="
                absolute top-0 left-0 right-0
                h-1 rounded-t-2xl
                bg-gradient-to-r
                from-[#C9A24D]
                via-[#E6C97A]
                to-[#C9A24D]
              "
            />

            {/* 🌿 GREEN INNER ACCENT */}
            <div
              className="
                absolute top-1 left-0 right-0
                h-[2px]
                bg-[#2F6B4F]
                opacity-60
              "
            />

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
