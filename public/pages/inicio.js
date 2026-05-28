function carregarInicio() {
    setActive('btn-inicio')
    setConteudo(`
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div class="dash-glass dash-animate" style="padding:20px;">
                <div class="flex items-center gap-3 mb-3">
                    <div class="dash-card-icon" style="background:rgba(59,130,246,0.12); color:#3b82f6;">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                    </div>
                    <span style="font-size:13px; font-weight:700; color:rgba(255,255,255,0.9);">Produtos</span>
                </div>
                <p id="count-produtos" style="font-size:32px; font-weight:800; color:#fff;">—</p>
            </div>
            <div class="dash-glass dash-animate" style="padding:20px;">
                <div class="flex items-center gap-3 mb-3">
                    <div class="dash-card-icon" style="background:rgba(168,85,247,0.12); color:#a855f7;">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                    </div>
                    <span style="font-size:13px; font-weight:700; color:rgba(255,255,255,0.9);">Usuários</span>
                </div>
                <p style="font-size:32px; font-weight:800; color:#fff;">—</p>
            </div>
            <div class="dash-glass dash-animate" style="padding:20px;">
                <div class="flex items-center gap-3 mb-3">
                    <div class="dash-card-icon" style="background:rgba(34,197,94,0.12); color:#22c55e;">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <span style="font-size:13px; font-weight:700; color:rgba(255,255,255,0.9);">Status</span>
                </div>
                <p style="font-size:14px; font-weight:700; color:#22c55e;">● Online</p>
            </div>
        </div>
        <div class="dash-glass dash-animate" style="padding:24px; text-align:center;">
            <svg width="48" height="48" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:12px;"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            <h3 style="font-size:18px; font-weight:700; color:rgba(255,255,255,0.85); margin-bottom:4px;">Bem-vindo ao ERP Avanzi</h3>
            <p style="font-size:13px; color:rgba(255,255,255,0.35);">Use o menu lateral para navegar entre os módulos.</p>
        </div>
    `, 'Dashboard')

    fetch(API+'/produtos?page=1&limit=1', { headers: authHeaders() })
        .then(r => r.json())
        .then(data => {
            const el = document.getElementById('count-produtos')
            if (el && data.total) el.textContent = data.total.toLocaleString('pt-BR')
        }).catch(() => {})
}
