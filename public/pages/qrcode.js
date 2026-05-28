let qrCodeInstance = null

function carregarQrcode() {
    setActive('btn-qrcode')

    setConteudo(`
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">

            <div class="dash-glass dash-animate" style="padding:20px;">
                <div class="flex items-center gap-2 mb-4">
                    <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="8" y="8" width="8" height="8"/><line x1="3" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="21"/></svg>
                    <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Configurar QR Code</span>
                </div>

                <div style="display:flex; flex-direction:column; gap:14px;">
                    <div>
                        <label style="font-size:11px; font-weight:600; color:rgba(255,255,255,0.35); display:block; margin-bottom:4px;">Texto / Link</label>
                        <textarea id="qr-texto" rows="3" placeholder="Digite o texto ou URL para o QR Code..."
                            style="width:100%; padding:10px 14px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; color:#fafafa; background:#252525; outline:none; resize:vertical; font-family:inherit; transition:border-color 0.3s; box-sizing:border-box;"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.4)'"
                            onblur="this.style.borderColor='rgba(255,255,255,0.08)'">https://</textarea>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                        <div>
                            <label style="font-size:11px; font-weight:600; color:rgba(255,255,255,0.35); display:block; margin-bottom:4px;">Cor do QR Code</label>
                            <div class="flex items-center gap-2">
                                <input id="qr-cor-qr" type="color" value="#b51515"
                                    style="width:40px; height:40px; border:none; border-radius:8px; cursor:pointer; background:none; padding:0;">
                                <input id="qr-cor-qr-hex" type="text" value="#b51515" maxlength="7"
                                    style="flex:1; padding:8px 10px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:12px; color:#fafafa; background:#252525; outline:none; font-family:monospace; box-sizing:border-box; text-transform:uppercase;"
                                    onfocus="this.style.borderColor='rgba(181,21,21,0.4)'"
                                    onblur="this.style.borderColor='rgba(255,255,255,0.08)'">
                            </div>
                        </div>
                        <div>
                            <label style="font-size:11px; font-weight:600; color:rgba(255,255,255,0.35); display:block; margin-bottom:4px;">Cor do Fundo</label>
                            <div class="flex items-center gap-2">
                                <input id="qr-cor-fundo" type="color" value="#ffffff"
                                    style="width:40px; height:40px; border:none; border-radius:8px; cursor:pointer; background:none; padding:0;">
                                <input id="qr-cor-fundo-hex" type="text" value="#ffffff" maxlength="7"
                                    style="flex:1; padding:8px 10px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:12px; color:#fafafa; background:#252525; outline:none; font-family:monospace; box-sizing:border-box; text-transform:uppercase;"
                                    onfocus="this.style.borderColor='rgba(181,21,21,0.4)'"
                                    onblur="this.style.borderColor='rgba(255,255,255,0.08)'">
                            </div>
                        </div>
                    </div>

                    <button id="qr-btn-gerar" style="padding:12px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; justify-content:center; gap:6px;"
                        onmouseenter="this.style.transform='translateY(-2px) scale(1.02)';this.style.boxShadow='0 8px 24px rgba(181,21,21,0.4)'"
                        onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(181,21,21,0.3)'"
                        onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='translateY(-2px) scale(1.02)'">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="8" y="8" width="8" height="8"/><line x1="3" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="21"/></svg>
                        Gerar QR Code
                    </button>

                    <p id="qr-status" style="font-size:11px; text-align:center; min-height:16px; color:rgba(255,255,255,0.3);"></p>
                </div>
            </div>

            <div class="dash-glass dash-animate" style="padding:20px; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:350px;">
                <div class="flex items-center gap-2 mb-4" style="align-self:stretch;">
                    <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="8" y="8" width="8" height="8"/><line x1="3" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="21"/></svg>
                    <span style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:rgba(255,255,255,0.25);">Preview</span>
                </div>
                <div id="qr-preview" class="flex items-center justify-center" style="flex:1; width:100%;">
                    <p style="color:rgba(255,255,255,0.15); font-size:12px;">Preencha os dados e clique em Gerar</p>
                </div>
                <button id="qr-btn-baixar" style="margin-top:14px; padding:10px 24px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#16a34a,#15803d); box-shadow:0 4px 16px rgba(22,163,74,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:none; align-items:center; gap:6px;"
                    onmouseenter="this.style.transform='translateY(-2px) scale(1.03)';this.style.boxShadow='0 8px 24px rgba(22,163,74,0.4)'"
                    onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(22,163,74,0.3)'"
                    onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='translateY(-2px) scale(1.03)'">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Baixar PNG
                </button>
            </div>

        </div>
    `, 'QR Code')

    document.getElementById('qr-cor-qr').oninput = (e) => document.getElementById('qr-cor-qr-hex').value = e.target.value
    document.getElementById('qr-cor-qr-hex').oninput = (e) => {
        const v = e.target.value.trim()
        if (/^#[0-9a-f]{6}$/i.test(v)) document.getElementById('qr-cor-qr').value = v
    }
    document.getElementById('qr-cor-fundo').oninput = (e) => document.getElementById('qr-cor-fundo-hex').value = e.target.value
    document.getElementById('qr-cor-fundo-hex').oninput = (e) => {
        const v = e.target.value.trim()
        if (/^#[0-9a-f]{6}$/i.test(v)) document.getElementById('qr-cor-fundo').value = v
    }

    document.getElementById('qr-btn-gerar').onclick = qrGerar
    document.getElementById('qr-btn-baixar').onclick = qrBaixar
    document.getElementById('qr-texto').onkeydown = (e) => { if (e.key === 'Enter') qrGerar() }
}

function qrGerar() {
    const texto = document.getElementById('qr-texto').value.trim()
    const status = document.getElementById('qr-status')

    if (!texto) { status.style.color = '#ef4444'; status.textContent = 'Digite um texto ou URL.'; return }

    status.style.color = 'rgba(255,255,255,0.4)'; status.textContent = 'Gerando QR Code...'

    const qrColor = document.getElementById('qr-cor-qr-hex').value.trim()
    const bgColor = document.getElementById('qr-cor-fundo-hex').value.trim()
    const preview = document.getElementById('qr-preview')

    preview.innerHTML = '<div id="qr-render" style="display:flex; align-items:center; justify-content:center;"></div>'

    if (qrCodeInstance) {
        qrCodeInstance.makeCode(texto)
        return
    }

    qrCodeInstance = new QRCode(document.getElementById('qr-render'), {
        text: texto,
        width: 250,
        height: 250,
        colorDark: qrColor,
        colorLight: bgColor,
        correctLevel: QRCode.CorrectLevel.H
    })

    const btn = document.getElementById('qr-btn-baixar')
    btn.style.display = 'flex'
    status.style.color = '#22c55e'; status.textContent = 'QR Code gerado!'
}

function qrBaixar() {
    const canvas = document.querySelector('#qr-render canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
}
