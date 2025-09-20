# 🚀 SCRIPT AUTOMÁTICO PARA ORGANIZAR FOTOS
# Este script será executado depois que você colocar todas as fotos na pasta FOTOS_PRODUTOS

# Mapeamento: qual foto vai para qual produto
$mapeamento = @{
    # Mouse Delux M600
    'mouse_delux' = @{
        pasta = 'public\produtos\mouse_delux'
        palavras = @('delux', 'delux', 'm600')
    }
    
    # Mouse Attack Shark X11
    'mouse_attack' = @{
        pasta = 'public\produtos\mouse_attack_shark'
        palavras = @('attack', 'shark', 'x11')
    }
    
    # Fone Lenovo GM2 Pro
    'fone_lenovo' = @{
        pasta = 'public\produtos\fone_lenovo'
        palavras = @('lenovo', 'fone', 'gm2')
    }
    
    # Teclado IROK MG75 Pro
    'teclado_irok' = @{
        pasta = 'public\produtos\teclado_irok'
        palavras = @('teclado', 'irok', 'mg75')
    }
    
    # Bonsai Artificial
    'bonsai' = @{
        pasta = 'public\produtos\bonsai'
        palavras = @('bonsai')
    }
    
    # Action Figure Venom
    'venom' = @{
        pasta = 'public\produtos\venom_figure'
        palavras = @('venom')
    }
    
    # Action Figure Majin Vegeta
    'vegeta' = @{
        pasta = 'public\produtos\majin_vegeta'
        palavras = @('vegeta', 'majin')
    }
    
    # Miniatura GTR R34
    'gtr' = @{
        pasta = 'public\produtos\gtr_miniatura'
        palavras = @('gtr', 'nissan', 'skyline', 'r34')
    }
}

Write-Host "🔄 ORGANIZANDO SUAS FOTOS AUTOMATICAMENTE..." -ForegroundColor Green
Write-Host ""

# Função para organizar fotos será adicionada quando você estiver pronto
Write-Host "📁 Pasta criada em: FOTOS_PRODUTOS/" -ForegroundColor Yellow
Write-Host "📸 Coloque suas fotos lá primeiro!" -ForegroundColor Yellow
Write-Host "🤖 Depois execute este script para organizar tudo automaticamente!" -ForegroundColor Green