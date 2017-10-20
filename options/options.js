/************************
* Define storage object
************************/
const storage = typeof InstallTrigger !== 'undefined'
    ? browser.storage  /* Firefox */
    : chrome.storage;  /* Chrome  */


/***************
* Placeholders
***************/
var default_editor;
var theme_sel;
var lng_sel;
var font_sel;
var font_size_sel;
var height;
var autoresize;
var tab_conv;
var tab_width;

var save_button;
var return_default_values;


function init_input(settings)
    {
        var option;
        var i;
        
        
        /* Append select items */
        for(i = 0; i < themes.length; i++)
            {
                option = document.createElement('OPTION');
                option.text = themes[i];
                
                if(themes[i] == settings.theme) { option.selected = 'selected'; }
                
                theme_sel.append(option);
            }
        for(i = 0; i < languages.length; i++)
            {
                option = document.createElement('OPTION');
                option.text = languages[i];
                
                if(languages[i] == settings.lng) { option.selected = 'selected'; }
                
                lng_sel.append(option);
            }
        for(i = 0; i < fonts.length; i++)
            {
                option = document.createElement('OPTION');
                option.text = fonts[i];
                
                if(fonts[i] == settings.font) { option.selected = 'selected'; }
                
                font_sel.append(option);
            }
        for(i = 0; i < 100; i++)
            {
                option = document.createElement('OPTION');
                option.text = i;
                
                if(i == settings.font_size) { option.selected = 'selected'; }
                
                font_size_sel.append(option);
            }
        
        
        /* Set input values */
        default_editor.checked = settings.default_editor;
        height.value           = settings.height;
        autoresize.checked     = settings.autoresize;
        
        tab_conv.checked = settings.tab_conv;
        tab_width.value = settings.tab_width;
    }


function save_settings()
    {
        storage.local.set
            (
                {
                    default_editor : default_editor.checked,
                    theme          : theme_sel.value,
                    lng            : lng_sel.value,
                    font           : font_sel.value,
                    font_size      : font_size_sel.value,
                    height         : height.value,
                    autoresize     : autoresize.checked,
                    
                    tab_conv    : tab_conv.checked,
                    tab_width  : tab_width.value
                },
                
                function()
                    {
                        save_button.textContent = 'Saved.';
                        setTimeout( function() { save_button.textContent = 'Save'; window.close(); }, 2000 );
                    }
            );
    }


window.onload = function()
{
    default_editor          = document.getElementById('default_editor');
    theme_sel               = document.getElementById('default_theme');
    lng_sel                 = document.getElementById('default_lng');
    font_sel                = document.getElementById('default_font');
    font_size_sel           = document.getElementById('default_font_size');
    height                  = document.getElementById('default_height');
    autoresize              = document.getElementById('autoresize');
    tab_conv                = document.getElementById('tab_conv');
    tab_width               = document.getElementById('tab_width');
    
    save_button             = document.getElementById('save_button');
    return_default_values   = document.getElementById('return_default_values');
    
    
    save_button.onclick           = () => save_settings();
    return_default_values.onclick = () => init_input(default_settings);
    
    
    /* Fix firefox layout */
    if(typeof InstallTrigger !== 'undefined')
        {
            autoresize.style.top            = '194px';
            tab_conv.style.top              = '217px';
            tab_width.style.top             = '239px';
            return_default_values.style.top = '240px';
        }
    
    
    /* Get settings */
    storage.local.get(default_settings, function(items)
        {
            init_input(items);
        });
};