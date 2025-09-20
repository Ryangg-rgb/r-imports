# 🚀 ORGANIZANDO SUAS FOTOS AUTOMATICAMENTE

Write-Host "🔄 ORGANIZANDO FOTOS DOS PRODUTOS..." -ForegroundColor Green

# Mapeamento das fotos
$produtos = @{
    'deluxm600' = @{
        pasta = 'public\produtos\mouse_delux'
        nome = 'Mouse Delux M600'
    }
    'attck' = @{
        pasta = 'public\produtos\mouse_attack_shark'
        nome = 'Mouse Attack Shark X11'
    }
    'gm2pro' = @{
        pasta = 'public\produtos\fone_lenovo'
        nome = 'Fone Lenovo GM2 Pro'
    }
    'irok' = @{
        pasta = 'public\produtos\teclado_irok'
        nome = 'Teclado IROK MG75 Pro'
    }
    'bonsai' = @{
        pasta = 'public\produtos\bonsai'
        nome = 'Bonsai Artificial'
    }
    'venon' = @{
        pasta = 'public\produtos\venom_figure'
        nome = 'Action Figure Venom'
    }
    'vgt' = @{
        pasta = 'public\produtos\majin_vegeta'
        nome = 'Action Figure Majin Vegeta'
    }
    'gtr' = @{
        pasta = 'public\produtos\gtr_miniatura'
        nome = 'Miniatura GTR R34'
    }
}

$origem = "FOTOS_PRODUTOS"

foreach ($produto in $produtos.Keys) {
    $info = $produtos[$produto]
    Write-Host "📸 Organizando: $($info.nome)" -ForegroundColor Yellow
    
    # Pegar as 3 primeiras fotos de cada produto
    $fotos = Get-ChildItem "$origem\ft*$produto*.jpg" | Sort-Object Name | Select-Object -First 3
    
    for ($i = 0; $i -lt $fotos.Count; $i++) {
        $numeroFoto = $i + 1
        $destino = "$($info.pasta)\foto$numeroFoto.jpg"
        
        if (Test-Path $fotos[$i].FullName) {
            Copy-Item $fotos[$i].FullName $destino -Force
            Write-Host "   ✅ $($fotos[$i].Name) → foto$numeroFoto.jpg" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "🎉 TODAS AS FOTOS ORGANIZADAS COM SUCESSO!" -ForegroundColor Green
Write-Host "🌐 Suas fotos já estão prontas para aparecer no site!" -ForegroundColor Cyan