import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        // Called when a new scene session is being created.
        guard let _ = (scene as? UIWindowScene) else { return }

        // Enable iOS native swipe-to-go-back edge navigation gesture
        DispatchQueue.main.async {
            if let rootVC = self.window?.rootViewController as? CAPBridgeViewController {
                rootVC.webView?.allowsBackForwardNavigationGestures = true
            }
        }
    }

    func sceneDidDisconnect(_ scene: UIScene) {
        // Called as the scene is being released by the system.
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        // Ensure web view navigation gestures remain active on resume
        if let rootVC = self.window?.rootViewController as? CAPBridgeViewController {
            rootVC.webView?.allowsBackForwardNavigationGestures = true
        }
    }

    func sceneWillResignActive(_ scene: UIScene) {
        // Called when the scene will move from an active state to an inactive state.
    }

    func sceneWillEnterForeground(_ scene: UIScene) {
        // Called as the scene transitions from the background to the foreground.
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
        // Called as the scene transitions from the foreground to the background.
    }
}
