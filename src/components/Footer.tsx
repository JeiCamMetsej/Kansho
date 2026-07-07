export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-primary)] mt-12 hidden sm:block">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="text-center sm:text-left">
            <p className="text-xs font-light tracking-tight text-[var(--text-primary)]">
              kanshō
            </p>
            <p className="mt-0.5 text-[10px] text-[var(--text-tertiary)]">
              Track, discover, and share your reading journey.
            </p>
          </div>

          {/* Contact links */}
          <div className="flex items-center gap-4">
            <a
              href="mailto:jeicammetsej@gmail.com"
              className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] transition-all duration-150 active:text-[var(--text-primary)]"
              aria-label="Email jeicammetsej"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <span>Email</span>
            </a>

            <a
              href="https://discord.com/users/jeicammetsej"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] transition-all duration-150 active:text-[var(--text-primary)]"
              aria-label="Discord jeicammetsej"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
              </svg>
              <span>Discord</span>
            </a>

            <a
              href="https://ko-fi.com/jeicammetsej"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] transition-all duration-150 active:text-[var(--text-primary)]"
              aria-label="Ko-fi jeicammetsej"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.881 8.948c-.773-1.072-2.893-1.522-4.25-1.682l-4.232-.488V5.5c0-1.307-.704-2.636-2.366-2.636H2.366C.704 2.864 0 4.192 0 5.5v13.636c0 1.307.704 2.636 2.366 2.636h10.667c1.662 0 2.366-1.329 2.366-2.636v-.297l4.268-.521c1.357-.165 3.466-.616 4.239-1.688.886-1.228.774-3.05.774-4.998 0-1.948-.106-3.77-.799-4.984zM7.255 3.705h5.513c.221 0 .443.221.443.442v.663H6.812v-.663c0-.221.222-.442.443-.442zm5.513 14.672a.738.738 0 01-.221.553c-.111.111-.221.111-.332.111H7.255a.369.369 0 01-.332-.111.738.738 0 01-.221-.553v-1.105h5.734v1.105h.332zm4.805-1.326c-1.326.166-2.311.221-3.031.221v-1.989c.829 0 1.768-.044 3.031-.166.941-.111 1.768-.332 1.768-1.105 0-.442-.332-.774-.774-.885-.166-.055-.388-.111-.664-.111v-1.989c.277 0 .498.055.664.111.442.111.774.443.774.885 0 .773-.828.994-1.768 1.105-1.263.111-2.202.166-3.031.166v-1.989c.72 0 1.705-.055 3.031-.221 1.105-.111 2.095-.443 2.652-1.105.442-.554.553-1.326.553-2.539v-1.546l4.897.553c.72.111 1.989.332 2.53.885.387.443.498 1.105.498 1.989v.111c0 1.657-.111 3.422-.387 4.53-.31 1.326-1.437 1.657-2.53 1.768l-5.513.553z" />
              </svg>
              <span>Ko-fi</span>
            </a>
          </div>
        </div>

        <p className="mt-6 text-[10px] text-center text-[var(--text-tertiary)]">
          &copy; {new Date().getFullYear()} Kanshō. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
