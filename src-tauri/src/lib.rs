use tauri::{Manager, RunEvent, WebviewUrl, WindowEvent};

use axum::{routing::get, Router};
use std::net::SocketAddr;

fn start_server() {
    tauri::async_runtime::spawn(async {
        let app = Router::new().route("/", get(|| async { "player loaded" }));

        let addr = SocketAddr::from(([127, 0, 0, 1], 1430));

        let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

        axum::serve(listener, app).await.unwrap();
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        // .setup(|app| {
        //     start_server();
        //     tauri::WebviewWindowBuilder::new(
        //         app,
        //         "yt",
        //         WebviewUrl::External("http://127.0.0.1:1430".parse().unwrap()),
        //     )
        //     .visible(true)
        //     .build()?;
        //     // what
        //     Ok(())
        // })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                // Prevent closing
                api.prevent_close();

                // Hide instead
                let _ = window.hide();
            }
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    app.run(|app_handle, event| {
        if let RunEvent::Reopen { .. } = event {
            if let Some(window) = app_handle.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
    });
}
