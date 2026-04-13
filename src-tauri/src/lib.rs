use rodio::{Decoder, OutputStream, Sink};
use std::fs::File;
use std::io::BufReader;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager, RunEvent, State, WindowEvent};
use tauri_plugin_notification::NotificationExt;
use tokio::sync::oneshot;
use tokio::time::interval;

struct TimerState {
    cancel_tx: Arc<Mutex<Option<oneshot::Sender<()>>>>,
}

// Helper to play the chime sound
fn play_chime(app_handle: AppHandle) {
    std::thread::spawn(move || {
        let resource_path = app_handle
            .path()
            .resolve("resources/chime.mp3", tauri::path::BaseDirectory::Resource)
            .expect("failed to resolve chime.mp3 path");

        if let Ok((_stream, stream_handle)) = OutputStream::try_default() {
            if let Ok(sink) = Sink::try_new(&stream_handle) {
                if let Ok(file) = File::open(resource_path) {
                    if let Ok(source) = Decoder::new(BufReader::new(file)) {
                        sink.append(source);
                        sink.sleep_until_end();
                    }
                }
            }
        }
    });
}

#[tauri::command]
async fn cancel_timer(state: State<'_, TimerState>) -> Result<(), String> {
    let mut lock = state.cancel_tx.lock().unwrap();
    if let Some(tx) = lock.take() {
        let _ = tx.send(());
    }
    Ok(())
}

#[tauri::command]
async fn start_timer(
    duration: u64,
    tag: String,
    session_id: Option<String>, // Now optional!
    app_handle: AppHandle,
    state: State<'_, TimerState>,
) -> Result<(), String> {
    let _ = cancel_timer(state.clone()).await;

    // Quick debug print to see what was passed
    println!(
        "Starting timer for {}ms | Session: {:?}",
        duration, session_id
    );

    let (tx, mut rx) = oneshot::channel();
    {
        let mut lock = state.cancel_tx.lock().unwrap();
        *lock = Some(tx);
    }

    tauri::async_runtime::spawn(async move {
        let mut heartbeat = interval(Duration::from_secs(30));
        let end_time = std::time::Instant::now() + Duration::from_millis(duration);

        loop {
            tokio::select! {
                // 1. Heartbeat: Tell JS to extend the session (ONLY if we have an ID)
                _ = heartbeat.tick() => {
                    if let Some(id) = &session_id {
                        let _ = app_handle.emit("timer_sync_db", id);
                    }
                }

                // 2. Completion
                _ = tokio::time::sleep(Duration::from_millis(500)) => {
                    if std::time::Instant::now() >= end_time {
                        play_chime(app_handle.clone());

                        // Final DB save before finishing (ONLY if we have an ID)
                        if let Some(id) = &session_id {
                            let _ = app_handle.emit("timer_sync_db", id);
                        }

                        // Tell the UI the timer is completely done (Always emitted)
                        let _ = app_handle.emit("timer_done", ());

                        if tag == "break" {
                            app_handle.notification().builder()
                                .title("Break over!")
                                .body("Let's start a new session.")
                                .show().unwrap();
                        } else {
                            let mins = duration / (1000 * 60);
                            app_handle.notification().builder()
                                .title(format!("#{} | {}m complete!", tag, mins))
                                .body("Take a break or start a new session.")
                                .show().unwrap();
                        }

                        // if let Some(window) = app_handle.get_webview_window("main") {
                        //     let _ = window.show();
                        //     let _ = window.unminimize();
                        //     let _ = window.set_focus();
                        // }
                        break;
                    }
                }

                // 3. Cancellation
                _ = &mut rx => {
                    // Save partial progress right before cancelling (ONLY if we have an ID)
                    if let Some(id) = &session_id {
                        let _ = app_handle.emit("timer_sync_db", id);
                    }
                    println!("Timer was cancelled");
                    break;
                }
            }
        }
    });

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .manage(TimerState {
            cancel_tx: Arc::new(Mutex::new(None)),
        })
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![start_timer, cancel_timer])
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    app.run(|app_handle, event| {
        #[cfg(target_os = "macos")]
        if let RunEvent::Reopen { .. } = event {
            if let Some(window) = app_handle.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
    });
}
