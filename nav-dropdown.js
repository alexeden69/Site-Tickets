(function () {
    function getSportType(text) {
        text = (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        if (/tennis|roland.garros|monte.carlo|queen|wimbledon|atp|wta/.test(text)) return 'tennis';
        if (/rugby|6 nations|six nations|nations/.test(text)) return 'rugby';
        if (/basketball|nba/.test(text)) return 'basketball';
        if (/fifa|world cup|premier|ligue|bundesliga|liga/.test(text)) return 'football';
        return null;
    }

    function buildSportItems() {
        var STATIC = [
            { q: 'football', label: '⚽ Football' },
            { q: 'tennis',   label: '🎾 Tennis' },
            { q: 'rugby',    label: '🏉 Rugby' },
        ];
        var items = [{ href: 'sports.html', label: '🏅 Tous les sports' }];

        if (typeof getSportsForDisplay === 'function') {
            var found = {};
            getSportsForDisplay().forEach(function (item) {
                var text = item.isGroup
                    ? item.groupName + ' ' + item.events.map(function (e) { return (e.league || '') + ' ' + e.name; }).join(' ')
                    : (item.league || '') + ' ' + item.name;
                var t = getSportType(text);
                if (t) found[t] = true;
            });
            STATIC.forEach(function (s) {
                if (found[s.q]) items.push({ href: 'sports.html?q=' + s.q, label: s.label });
            });
        } else {
            // Static fallback — show all known categories
            STATIC.forEach(function (s) {
                items.push({ href: 'sports.html?q=' + s.q, label: s.label });
            });
        }
        return items;
    }

    function buildConcertItems() {
        var items = [{ href: 'concerts.html', label: '🎵 Tous les concerts' }];
        if (typeof getConcertsForDisplay !== 'function') return items;

        var seen = {};
        var count = 0;
        getConcertsForDisplay().forEach(function (item) {
            if (count >= 5) return;
            var name = item.isGroup ? item.groupName : item.name;
            var artist = name.split('—')[0].split('(')[0].trim();
            if (!seen[artist] && artist.length > 1) {
                seen[artist] = true;
                items.push({
                    href: 'concerts.html?q=' + encodeURIComponent(artist.toLowerCase()),
                    label: '🎤 ' + artist
                });
                count++;
            }
        });
        return items;
    }

    function buildDropdown(li, items) {
        if (!li || !items || items.length <= 1) return;
        li.classList.add('has-dropdown');

        var link = li.querySelector('a');
        if (link && !link.querySelector('.dropdown-arrow')) {
            var arrow = document.createElement('span');
            arrow.className = 'dropdown-arrow';
            arrow.textContent = ' ▾';
            link.appendChild(arrow);
        }

        var old = li.querySelector('.nav-subdrop');
        if (old) old.remove();

        var drop = document.createElement('div');
        drop.className = 'nav-subdrop';
        items.forEach(function (item) {
            var a = document.createElement('a');
            a.href = item.href;
            a.textContent = item.label;
            drop.appendChild(a);
        });
        li.appendChild(drop);
    }

    function init() {
        document.querySelectorAll('.nav-links > li').forEach(function (li) {
            var a = li.querySelector('a');
            if (!a) return;
            var href = a.getAttribute('href') || '';
            if (href.indexOf('sports.html') !== -1) {
                buildDropdown(li, buildSportItems());
            } else if (href.indexOf('concerts.html') !== -1) {
                buildDropdown(li, buildConcertItems());
            }
        });
    }

    // Run immediately with static data
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Also rebuild with live data when sheets-loader fires
    document.addEventListener('eventsLoaded', init);
}());
