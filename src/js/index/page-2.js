
{
    let view =  {
        el: '.page-2',
        $el: null,
        init(){
            this.$el = $(this.el)
        },
        render(data){
            let {songs} = data
            songs.map(song=>{
                let {singer,name,id} = song
                let $li = $(`
                <li>
                    <h3>${name}</h3>
                    <p>
                        <svg class="icon icon-sq">
                            <use xlink:href="#icon-sq"></use>
                        </svg>
                        ${singer}
                    </p>
                    <a class="playButton" href="./song.html?id=${id}">
                        <svg class="icon icon-play">
                            <use xlink:href="#icon-play"></use>
                        </svg>
                    </a>
                </li>`)
                this.$el.find('.list').append($li)
            })
        }
    }
    let model = {
        data: {
            songs: []
        },
        find(){
            var playlist = AV.Object.createWithoutData('Playlist', '5c41897944d904006a527080')
            var query = new AV.Query('Song')
            query.equalTo('dependent', playlist)
            return query.find().then((songs)=>{
                songs.map(song=>{
                    this.data.songs.push({...song.attributes})
                })
                return this.data
            })
        }
    }
    let controller = {
        view: null,
        model: null,
        init(view, model){
            this.view = view
            this.model = model
            this.view.init()
            this.model.find().then((data)=>{
                this.view.render(data)
            })
        }
    }
    controller.init(view, model)
}