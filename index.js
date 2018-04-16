var a = 4;

$(() => {
    $('.broadcast').on('click', e => {
        const name = $(e.currentTarget).attr('data-view');
        console.log(name);

        $.ajax({
            type: 'GET',
            url: `${name}.html`
        }).done(data => {
            console.log(data);
            $('.broadcast-full-view').html(data);
        });
    });

    let keypressed = false;
    const element = $(`#player`);
    const volume = $('.volume-control');
    const wrap = $(`.volume`);
    const width = wrap.width();
    const start = wrap.offset().left;
    volume.css('left', width);

    volume.on('mousedown', () => keypressed = true);
    $(document).on('mouseup', () => keypressed = false);
    $(document).on('mousemove', e => {
        if (!keypressed) {
            return;
        }

        if (e.pageX > start & e.pageX < start + width) {
            volume.css('left', e.pageX - start);
            console.log((e.pageX - start) / width);
            element[0].volume = (e.pageX - start) / width;
        }
    });

    const button = $('.play')

    button.on('click', () => {
        if (button.hasClass('stopped')) {
            element[0].play();
            button.removeClass('stopped');
            button.addClass('playing');
            return;
        } 

        element[0].pause();
        element[0].currentTime = 0;
        button.addClass('stopped');
        button.removeClass('playing');
    });

    function getSongName() {
        $.ajax({
            url: 'https://radio.mipt.ru/php/icecast-current-track.php'
        }).done(data => {
            const songData = data.split('-');
            $('.song-name').html(`<span>${songData[0].trim()}</span><span>${songData[1].trim()}</span>`)
        });
    }

    setInterval(() => {
        getSongName();
    }, 5000);

    getSongName();
});


