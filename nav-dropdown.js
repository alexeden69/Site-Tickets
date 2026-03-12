(function () {
    // Sport type detection from text (league + name)
    function getSportType(text) {
        text = (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        if (/tennis|roland.garros|monte.carlo|queen|wimbledon|atp|wta/.test(text)) return 'tennis';
        if (/rugby|6 nations|six nations|nations/.test(text)) return 'rugby';
        if (/basketball|nba/.test(text)) return 'basketball';
        if (/fifa|world cup|premier|ligue|bundesliga|liga/.test(text)) return 'football';
        return null;
    }

    // Build sport dropdown items from live data (or static fallback)
    function buildSportItems() {
        var items = [{ href: 'sports.html', label: '🏅 Tous les sports' }];
        var STATIC = [
            { q: 'football', label: '⚽ Football' },
            { q: 'tennis',   label: '🎾 Tennis' },
            { q: 'rugby',    label: '🏉 Rugby' },
        ];

        if (typeof getSportsForDisplay === 'function') {
            // Build from real data
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
            // Static fallback for pages without sheets-loader
            STATIC.forEach(function (s) {
                items.push({ href: 'sports.html?q=' + s.q, label: s.label });
            });
        }
        return items;
    }

    // Build concert dropdown items from live data (top artists/groups)
    function buildConcertItems() {
        var items = [{ href: 'concerts.html', label: '🎵 Tous les concerts' }];
        if (typeof getConcertsForDisplay !== 'function') return items;

        var seen = {};
        var count = 0;
        getConcertsForDisplay().forEach(function (item) {
            if (count >= 5) return;
            var name = item.isGroup ? item.groupName : item.name;
            // Strip " — City (date)" suffixes, keep artist name
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

        // Add arrow indicator to the link
        var link = li.querySelector('a');
        if (link && !link.querySelector('.dropdown-arrow')) {
            var arrow = document.createElement('span');
            arrow.className = 'dropdown-arrow';
            arrow.textContent = ' ▾';
            link.appendChild(arrow);
        }

        // Remove existing dropdown if rebuilding
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
        var lis = document.querySelectorAll('.nav-links > li');
        lis.forEach(function (li) {
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

    // Run after data is ready
    if (typeof getSportsForDisplay === 'function') {
        // sheets-loader already ran synchronously (shouldn't happen, but safe)
        init();
    } else if (typeof loadEventsFromSheet === 'function' || document.querySelector('script[src*="sheets-loader"]')) {
        // This page loads sheets-loader — wait for data
        document.addEventListener('eventsLoaded', init);
    } else {
        // No sheets-loader on this page — run immediately with static content
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }
}());
