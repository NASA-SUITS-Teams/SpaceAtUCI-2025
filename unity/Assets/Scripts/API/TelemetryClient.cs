// api to connect unity to telemetry stream
using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

public class TelemetryClient : MonoBehaviour {
    // makes private variables visible/editable in unity's editor
    [SerializeField] private string backendURL = "http://localhost:8000";
    [SerializeField] private float pollingInterval = 1.0f;

    private TelemetryData currentData;
    public event Action<TelemetryData> OnDataReceived;

    // start pulling data
    private void Start() {
        StartCoroutine(PollTelemetryData());
    }

    // send data back as json
    private IEnumerator PollTelemetryData() {
        while(true) {
            // send request to unity to get data
        }
    }
}