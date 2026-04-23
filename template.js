'use strict';
/* eslint-disable no-unused-vars */
function createHtmlContent ( data ) {
	return `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${ data.title }</title>
        <meta name="description" content="This tech tree was generated using WT-Tech-Tree-Maker." />
        <meta name="generator" content="https://github.com/przemyslaw-zan/WT-Tech-Tree-Maker" />
        <link rel="icon" href="https://warthunder.com/i/favicons/mstile-144x144.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="stylesheet" href="Other/css/deck_style.css">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    </head>
    <body>
    <header>
        <div class="header-title">
            <img src="Other/img/Logo_Ranked.png" alt="Logo">
            <h1>Deck : ${ data.title }</h1>
        </div>
        <a href="../index.html" class="back-btn">&#8592; Retour au Portail</a>
    </header>

    <div style="max-width: 1000px; margin: auto; padding: 20px 3px 0 3px">
        <div style="color: var(--text-muted); text-align: center;">${ data.description }</div>
    </div>
        <div id="techTreeWrapper">
            <div id="techTree">${ data.tree }</div>
        </div>
        <footer>
            <div>
                <a href="https://github.com/WarGameRP/Our-WT-TT-Maker" target="_blank">
                    <b>Github</b>
                    <img src="https://raw.githubusercontent.com/przemyslaw-zan/WT-Tech-Tree-Maker/main/images/github.png">
                </a>
                <i>Source code</i>
            </div>
            <div>
                <a href="https://discord.gg/75jgnDXtUZ" target="_blank">
                    <b>Discord</b>
                    <img src="https://www.svgrepo.com/show/353655/discord-icon.svg">
                </a>
                <i>Join our community</i>
            </div>
            <div>
                <a href="https://github.com/przemyslaw-zan/WT-Tech-Tree-Maker" target="_blank">
                    <b>Original Fork</b>
                    <img src="https://raw.githubusercontent.com/przemyslaw-zan/WT-Tech-Tree-Maker/main/images/github.png">
                </a>
                <i>Original tool</i>
            </div>
        </footer>
        <div id="vehicleDisplayModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <span class="close">&times;</span>
                    <h2 id="modal_title"></h2>
                </div>
                <div class="modal-gallery">
                    <div class="galleria" id="galleria"></div>
                </div>
                <div class="modal-body" id="modalDesc"></div>
            </div>
        </div>
    </body>
    <style>
        ${ data.styles }
    </style>
    <script
        src="https://code.jquery.com/jquery-3.5.1.js"
        integrity="sha256-QWo7LDvxbWT2tbbQ97B53yJnYU3WhH/C8ycbRAkjPDc="
        crossorigin="anonymous"
    ></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/galleria/1.6.1/galleria.min.js"></script>
    <script>
        const vehicleList = ${ data.vehicles }
        const descriptionTemplate =
        '<h3><em>Year:</em> <strong>XXXX</strong>&nbsp;<em>Development stage:</em>&nbsp;<strong>X</strong></h3>\u005Cn\u005Cn<p>Historical description...</p>\u005Cn\u005Cn<h3><em>Primary weapon:</em> <strong>X</strong></h3>\u005Cn\u005Cn<p>Primary weapon description...</p>\u005Cn\u005Cn<h3><em>Secondary weapon:</em> <strong>X</strong></h3>\u005Cn\u005Cn<p>Secondary weapon description...</p>\u005Cn\u005Cn<h3><em>Other info:</em></h3>\u005Cn\u005Cn<p>Crew, armor, mobility etc...</p>\u005Cn\u005Cn<h3><em>Proposed BR:</em> <strong>X.X</strong></h3>\u005Cn\u005Cn<p>Justification for Battle Rating placement...</p>\u005Cn\u005Cn<p><em>Links:</em></p>\u005Cn\u005Cn<ol>\u005Cn\u005Ct<li>Source 1...</li>\u005Cn\u005Ct<li>Source 2...</li>\u005Cn\u005Ct<li>WT forum discussion on the vehicle...</li>\u005Cn</ol>\u005Cn'
        const settings = {
            menuVisible: true,
            screenshotMode: false,
            thumbnailStyle: '0'
        };

        Galleria.loadTheme('https://cdnjs.cloudflare.com/ajax/libs/galleria/1.6.1/themes/classic/galleria.classic.min.js')
        Galleria.run('.galleria')
        Galleria.configure({
            _toggleInfo: false
        })

        document.querySelectorAll( '.close' ).forEach( ( item ) => {
            item.addEventListener( 'click', closeModal );
        } );
        window.onclick = function (event) {
            if (event.target.classList.contains('modal')) {
                closeModal()
            }
        }

        document.querySelector( '#techTree' ).addEventListener( 'click', techTreeClickProcessor );

        // Credits display function for exported tree
        function renderCreditsForDisplay( credits, container ) {
            if ( !credits || credits.length === 0 ) return;

            const creditsDiv = document.createElement( 'div' );
            creditsDiv.classList.add( 'vehicle-credits' );
            creditsDiv.style.marginTop = '16px';
            creditsDiv.style.paddingTop = '16px';
            creditsDiv.style.borderTop = '1px solid #30363d';

            const title = document.createElement( 'h4' );
            title.innerText = 'Credits';
            title.style.color = '#f0ad4e';
            title.style.marginBottom = '12px';
            title.style.fontSize = '1rem';
            creditsDiv.appendChild( title );

            credits.forEach( credit => {
                const tag = document.createElement( 'span' );
                tag.style.display = 'inline-flex';
                tag.style.alignItems = 'center';
                tag.style.gap = '6px';
                tag.style.padding = '4px 12px';
                tag.style.margin = '4px';
                tag.style.borderRadius = '16px';
                tag.style.fontSize = '0.85rem';
                tag.style.fontWeight = '500';
                tag.style.background = credit.color + '20';
                tag.style.border = '1px solid ' + credit.color;
                tag.style.color = credit.color;
                const iconText = credit.icon ? credit.icon + ' ' : '';
                tag.innerHTML = iconText + credit.value + ' (' + credit.typeName + ')';
                creditsDiv.appendChild( tag );
            } );

            container.appendChild( creditsDiv );
        }

        ${ data.functions.map( fn => fn.toString() ).join( ';' ) }
    </script>
</html>
`;
}
