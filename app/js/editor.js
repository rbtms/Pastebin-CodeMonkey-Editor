/************
* Constants
************/
const editor_textarea = $('#paste_code');
const content_title   = $('.content_title.no_border');

/* Define storage object */
const storage = typeof InstallTrigger !== 'undefined'
    ? browser.storage /* Firefox */
    : chrome.storage; /* Chrome  */


/*******************
* Global variables
*******************/

/* Placeholders**/
var editor;
var toggle_editor;
var lng_sel, theme_sel, font_sel, font_size_sel, util_sel;
var display_on_load;


var settings = {};


/* Lint doesn't work if window.JSHINT is not defined */
window.JSHINT = JSHINT;



/**********************************************************************
* Name        : is_main
* Description : Check if its on the main page or on a loaded pastebin
* Takes       : Nothing
* Returns     : (boolean) - Wether it's on the main page or not
**********************************************************************/
function is_main() { return (window.location.toString() == 'https://pastebin.com/' || window.location.toString().includes('index')); }


/**********************************************************
* Name        : get_pastebin_lng
* Description : Get pastebin syntax highlighting language
* Takes       : Nothing
* Returns     : (string) - Syntax highlighting language
**********************************************************/
function get_pastebin_lng() { return $('.buttonsm')[6].textContent; }


/**************************************************
* Name        : set_editor
* Description : Set editor for the first time
* Takes       : Nothing
* Returns     : Nothing
**************************************************/
function set_editor()
    {
        load_css(settings.theme+'.css');
        
        /* Add size css rules */
        var css = document.createElement('STYLE');
        if(settings.autoresize)
            {
                css.innerHTML = '.CodeMirror        { height: auto !important; } '
                              + '.CodeMirror-scroll { min-height: '+settings.height+'px; }';
            }
        else
            {
                css.innerHTML = '.CodeMirror { min-height: '+settings.height+'px; }';
            }
        document.body.appendChild(css);
        
        
        editor = CodeMirror.fromTextArea
            (
                editor_textarea[0],
                {
                    mode              : settings.lng.toLowerCase(),
                    theme             : settings.theme,
                    indentUnit        : settings.ind_spaces,
                    lineNumbers       : true,
                    viewportMargin    : settings.autoresize ? Infinity : false, /* Automatically resize to fit the code */
                    styleActiveLine   : true,
                    autoCloseBrackets : true,
                    gutters           : ["CodeMirror-lint-markers"],
                    lint              : false
                }
            );

        
        /* Convert tabs to spaces */
        if(settings.tab_conv)
            {
                editor.setOption( "extraKeys", { Tab: function(cm)
                    {
                        var spaces = new Array(parseInt(settings.tab_width) + 1).join(" ");
                        cm.replaceSelection(spaces);
                    }});
            }
    }


/*****************************************************
* Name        : load_css
* Description : Load local css files
* Takes       : filename (string) - Css file to load
* Returns     : Nothing
*****************************************************/
function load_css(filename)
    {
        var resource_url = chrome.runtime.getURL('./codemirror/theme/'+filename);
        
        $('head').append('<link rel="stylesheet" href="'+resource_url+'"/>');
    }


/****************************************
* Name        : set_language
* Description : Change current language
* Takes       : lng (string) - Language
* Returns     : Nothing
****************************************/
function set_language(lng)
    {
        lng = lng.toLowerCase();
        
        if(lng != 'javascript') { editor.setOption('lint', false); }
        editor.setOption('mode', lng);
    }


/***************************************************
* Name        : set_theme
* Description : Change current theme
* Takes       : theme    (string) - Theme name
*               filename (string) - Theme filename
* Returns     : Nothing
***************************************************/
function set_theme(theme)
    {
        filename = /solarized/.test(theme) ? 'solarized.css' : theme+'.css';
        console.log(theme, filename);
        
        load_css(filename);
        
        editor.setOption('theme', theme);
    }


/************************************************
* Name        : toggle_selection_highlight
* Description : Toggle match highlighting addon
* Takes       : Nothing
* Returns     : Nothing
************************************************/
function toggle_selection_highlight()
    {
        var is_on = editor.getOption('highlightSelectionMatches');
        
        editor.setOption
            (
                'highlightSelectionMatches',
                is_on === false ? {showToken: /\w/, annotateScrollbar: true} : false
            );
    }

/*************************************
* Name        : beautify
* Description : Beautify editor code
* Takes       : Nothing
* Returns     : Nothing
*************************************/
function beautify()
    {
        var is_hidden = editor_textarea.css('display') != 'block';
        
        var text = is_hidden ? editor.getValue() : editor_textarea.val();
        text = js_beautify(text);
        
        is_hidden ? editor.setValue(text) : editor_textarea.val(text);
    }

/*******************************************
* Name        : toggle_lint
* Description : Enable and disable linting
* Takes       : Nothing
* Returns     : Nothing
*******************************************/
function toggle_lint()
    {
        var lng = editor.getOption('mode');
        if(lng != 'javascript')
            {
                alert('Linting is only implemented for javascript');
                return;
            }
        
        editor.setOption('lint', !editor.getOption('lint'));
    }

/*********************************************
* Name        : util
* Description : Utilities
* Takes       : name (string) - Util to call
* Returns     : Nothing
*********************************************/
function util(name)
    {
        if     (name == 'Match Highlight') { toggle_selection_highlight(); }
        else if(name == 'Beautify' )       { beautify(); }
        else if(name == 'Lint (JS)' )      { toggle_lint(); }
    }

/************************************************************
* Name        : toggle_editor
* Description : Toggle between native and codemirror editor
* Takes       : Nothing
* Returns     : Nothing
************************************************************/
function toggle_editor()
    {
        var is_hidden;
        
        
        /* Toggle editor */
        $('.CodeMirror').toggle();
        editor_textarea.toggle();
        
        
        /* Hide selects */
        $('#lng_sel, #theme_sel, #font_sel, #font_size_sel').toggle();
        $('#codemirror_util').toggle();
        
        
        /* Copy value between editor */
        is_hidden = editor_textarea.css('display') != 'block';
        
        if(is_hidden) { editor.setValue( editor_textarea.val() ); }
        else          { editor_textarea.val( editor.getValue() ); }
        
        
        /* Toggle code frame */
        if( !is_main() ) { $('#code_frame2').toggle(); }
    }

/*************************************************************
* Name        : init_editor
* Description : Initialize editor and content title elements
* Takes       : Nothing
* Returns     : Nothing
*************************************************************/
function init_editor()
    {
        var lng, theme, font, size;
        var i;
        
        
        /****************
        * Create editor
        ****************/
        set_editor();
        
        
        /******************************************
        * Add constant elements to dropdown menus
        ******************************************/
        /* Languages dropdown */
        for(i = 0; i < languages.length; i++)
            {
                lng = $(document.createElement('OPTION')).text(languages[i]);
                
                if(languages[i] == settings.lng) { lng.attr('selected', 'selected'); }
                
                lng_sel.append(lng);
            }
        
        /* Themes dropdown */
        for(i = 0; i < themes.length; i++)
            {
                theme = $(document.createElement('OPTION')).text(themes[i]);
                
                if(themes[i] == settings.theme) { theme.attr('selected', 'selected'); }
                
                theme_sel.append(theme);
            }
        
        /* Fonts dropdown */
        for(i = 0; i < fonts.length; i++)
            {
                font = $(document.createElement('OPTION')).text(fonts[i]);
                
                if(fonts[i] == settings.font) { font.attr('selected', 'selected'); }
                
                font_sel.append(font);
            }
        
        /* Font size dropdow */
        for(i = 1; i <= 100; i++)
            {
                size = $(document.createElement('OPTION')).text(i);
        
                if(i == settings.font_size) { size.attr('selected', 'selected'); }
                
                font_size_sel.append(size);
            }
        
        
        /*************************************************
        * Copy editor text to textarea before submitting
        *************************************************/
        $('#myform').submit( function()
            {
                editor_textarea.val( editor.getValue() );
                
                return true;
            });

        
        /***********************************************
        * Hide code frame if it's not in the main page
        ***********************************************/
        if( !is_main() ) { $('#code_frame2').hide(); }
    }

function init_elements()
    {
        /*************************
        * Content title elements
        *************************/
        content_title.append
            (
                /* Toggle editor button */
                $(document.createElement('BUTTON'))
                    .addClass('content_title_button button1')
                    .attr('id', 'toggle_editor_button')
                    .text(settings.default_editor ? 'Native' : 'CodeMirror')
                    .on('click', function()
                        {
                            if(editor === undefined)
                                {
                                    init_editor();
                                    
                                    /* Don't hide the editor the first time */
                                    $('#lng_sel, #theme_sel, #font_sel, #font_size_sel').show();
                                    $('#codemirror_util').show();
                                    
                                    editor.setValue( editor_textarea.val() );
                                }
                            else
                                {
                                    toggle_editor();
                                }
                            
                            
                    this.textContent = this.textContent == 'CodeMirror' ? 'Native' : 'CodeMirror';
                }),
        
        
                /* Util select */
                $(document.createElement('SELECT'))
                    .attr('id', 'util_sel')
                    .addClass('content_title_select')
                    .on( 'change', function()
                        {
                            util(this.value);
                            this.value = 'Util';
                        })
                    .append
                        (
                            /* Default option */
                            $(document.createElement('OPTION'))
                                .text('Util')
                                .css('display', 'none'),
                            
                            /* General Util */
                            $(document.createElement('OPTGROUP'))
                                .attr('label', 'General Util')
                                .attr('id', 'general_util')
                                .append
                                    (
                                        /* Beautify */
                                        $(document.createElement('OPTION')).text('Beautify')
                                    ),
                                    
                            /* CodeMirror Util */
                            $(document.createElement('OPTGROUP'))
                                .attr('label', 'CodeMirror Util')
                                .attr('id', 'codemirror_util')
                                .css('display', display_on_load)
                                .append
                                    (
                                        /* Match highlight */
                                        $(document.createElement('OPTION')).text('Match Highlight'),
                                        
                                        /* Lint */
                                        $(document.createElement('OPTION')).text('Lint (JS)')
                                    )
                        ),
        
        
                /* Language select */
                $(document.createElement('SELECT'))
                    .attr('id', 'lng_sel')
                    .addClass('content_title_select')
                    .css('display', display_on_load)
                    .on( 'change', (e) => set_language(e.target.value) ),
        
        
                /* Theme select */
                $(document.createElement('SELECT'))
                    .attr('id', 'theme_sel')
                    .addClass('content_title_select')
                    .css('display', display_on_load)
                    .on( 'change', (e) => set_theme(e.target.value) ),
        
        
                /* Font select */
                $(document.createElement('SELECT'))
                    .attr('id', 'font_sel')
                    .addClass('content_title_select')
                    .css('display', display_on_load)
                    .on('change', (e) => $('.CodeMirror').css('font-family', e.target.value)),
        
        
                /* Font size select */
                $(document.createElement('SELECT'))
                    .attr('id', 'font_size_sel')
                    .addClass('content_title_select')
                    .css('display', display_on_load)
                    .on( 'change', (e) => $('.CodeMirror').css('font-size', parseInt(e.target.value)) )
            );
    }


/* Highlight selected text button warning */
$('.i_highlight').on('click', function()
    {
        var is_hidden = editor_textarea.css('display') != 'block';
        if(is_hidden) { alert('Not implemented on codemirror editor.'); }
    });


/***************
* Get settings
***************/
storage.local.get(default_settings, function(items)
    {
        for(var key in items) { settings[key] = items[key]; }
        
        
        /************************************
        * Get page language if it's a paste
        ************************************/
        settings.lng = is_main()
            ? settings.lng
            : language_detection[ get_pastebin_lng() ] === ''
                ? 'Text'
                : language_detection[ get_pastebin_lng() ];

        display_on_load = settings.default_editor ? 'inline-block' : 'none';
        
        
        /*************************
        * Initiate page elements
        *************************/
        init_elements();
        
        /********************
        * Load placeholders
        ********************/
        toggle_button = $('#toggle_editor_button');
        lng_sel       = $('#lng_sel');
        theme_sel     = $('#theme_sel');
        font_sel      = $('#font_sel');
        font_size_sel = $('#font_size_sel');
        util_sel      = $('#util_sel');
        

        if(settings.default_editor) { init_editor(); }
        
        
        /*******************************
        * Load paste language on clone
        *******************************/
        if( settings.load_lng && window.location.toString().includes('index') )
            {
                var paste = window.location.toString().replace('index/', '');
                
                $.get(paste, function(body, status, xhr)
                    {
                        if(xhr.readyState == 4 && status == 'success')
                            {
                                var lng = $(body).find('.buttonsm')[6];
                                
                                if(lng === undefined) { return; }
                                else { lng = lng.textContent; }
                                
                                
                                if(language_detection[lng] === undefined) { lng = 'Text'; }
                                else { lng = language_detection[lng]; }
                                
                                
                                /* Attempt to set language on settings.default_editor */
                                if(settings.default_editor)
                                    {
                                        set_language(lng);
                                        lng_sel.prop( 'selectedIndex', languages.indexOf(lng) );
                                    }
                                else
                                    {
                                        /* Set language on editor toggle */
                                        toggle_button.one('click', function()
                                            {
                                                lng_sel.prop( 'selectedIndex', languages.indexOf(lng) );
                                                set_language(lng);
                                            });
                                    }
                            }
                    });
            }

        
        console.log('Extension loaded.');
    });